import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { signup } from '~/services/api/authApi';

export const useSignupMutation = () => {
  return useMutation({
    mutationFn: signup,
    onSuccess: (data, variables) => {
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
      let errorMessage = 'We encountered an issue signing you up. Please try again.';

      const errorMessageLower = error.message.toLowerCase();

      if (errorMessageLower.includes('already registered')) {
        errorMessage = 'This email is already registered. Please sign in or use a different email.';
      } else if (errorMessageLower.includes('network')) {
        errorMessage = 'Connection issue detected. Please check your internet and try again.';
      } else if (errorMessageLower.includes('validation')) {
        errorMessage = 'Please check all fields and ensure they meet the requirements.';
      } else if (errorMessageLower.includes('email')) {
        errorMessage = 'Please enter a valid email address (e.g., name@example.com).';
      } else if (errorMessageLower.includes('password')) {
        errorMessage = 'Password must be at least 8 characters with a mix of letters and numbers.';
      } else if (errorMessageLower.includes('timeout')) {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      }

      throw new Error(errorMessage);
    },
  });
};
