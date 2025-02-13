import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { verificationOtp } from '~/services/api/authApi';

export const useVerificationMutation = () => {
  return useMutation({
    mutationFn: verificationOtp,
    onSuccess: (data) => {
      if (data.success) {
        router.push('/auth/signin');
      }
    },
    onError: (error: Error) => {
      console.log('Verification failed:', error.message);
    },
  });
};
