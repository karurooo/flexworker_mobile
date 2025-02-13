import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { signup } from '~/services/api/authApi';

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data, variables) => {
      console.log('User signed up successfully:', data);

      // Navigate to the Verification screen
      router.push({
        pathname: '/auth/verification',
        params: {
          email: variables.email,
          firstName: variables.firstName,
          lastName: variables.lastName,
          role: variables.role,
        },
      });
    },
    onError: (error: any) => {
      console.log('Signup failed:', error);

      let errorMessage = 'An unexpected error occurred during signup.';
      if (error.message.includes('already registered')) {
        errorMessage = 'This email is already registered. Please log in or reset your password.';
      } else if (error.message.includes('network')) {
        errorMessage = 'A network error occurred. Please check your internet connection.';
      }

      throw new Error(errorMessage);
    },
  });
};
