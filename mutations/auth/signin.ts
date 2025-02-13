import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { signin } from '~/services/api/authApi';

export const useSigninMutation = () => {
  return useMutation({
    mutationFn: signin,
    onSuccess: (data, variables) => {
      console.log('User signed up successfully:', data);

      // Navigate to the Verification screen
      router.push({
        pathname: '/employer/(tabs)/home',
        params: { email: variables.email },
      });
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
