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
      console.log('Signin failed:', error);

      let errorMessage = 'An unexpected error occurred during siginp.';
      if (error.message.includes('not registered')) {
        errorMessage = 'This email is not registered. Please sign up or reset your password.';
      } else if (error.message.includes('network')) {
        errorMessage = 'A network error occurred. Please check your internet connection.';
      }

      throw new Error(errorMessage);
    },
  });
};
