import { useMutation, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { signin } from '~/services/api/authApi';
import { AUTH_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserStore } from '~/store/users';
import { userDataApi } from '~/services/api/users/userDataApi';

export const useSigninMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: signin,
    onSuccess: async (data) => {
      const authUser = data.user;
      const sessionToken = data.session?.access_token;

      if (!sessionToken) {
        throw new Error('No session token received');
      }

      // Update store with session token first
      useUserStore.getState().signIn(sessionToken);

      // Then set other auth info
      useUserStore.getState().setAuthentication(authUser.id, authUser.email ?? '', null);

      // Fetch user data and update role
      const userData = await userDataApi();
      useUserStore
        .getState()
        .setAuthentication(authUser.id, authUser.email ?? '', userData?.role ?? null);

      // Force state update
      await new Promise((resolve) => setTimeout(resolve, 50));
      queryClient.invalidateQueries({ queryKey: AUTH_DATA_QUERY_KEY });
    },
    onError: (error: any) => {
      let errorMessage = 'We encountered an issue signing you in. Please try again.';
      const errorLower = error.message.toLowerCase();

      if (errorLower.includes('invalid credentials')) {
        errorMessage = 'The email or password you entered is incorrect.';
      } else if (errorLower.includes('not registered')) {
        errorMessage = 'No account found with this email. Please sign up.';
      } else if (errorLower.includes('network')) {
        errorMessage = 'Connection issue detected. Please check your internet.';
      } else if (errorLower.includes('email not verified')) {
        errorMessage = 'Please verify your email first. Check your inbox.';
      } else if (errorLower.includes('too many attempts')) {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (errorLower.includes('account locked')) {
        errorMessage = 'Account temporarily locked. Reset password or try later.';
      }

      throw new Error(errorMessage);
    },
  });
};
