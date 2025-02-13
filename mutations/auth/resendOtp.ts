// mutations/auth/resendOtp.ts
import { useMutation } from '@tanstack/react-query';
import { supabase } from '~/services/supabase';

interface ResendOtpData {
  email: string;
}

export const useResendOtpMutation = () => {
  return useMutation({
    mutationFn: async ({ email }: ResendOtpData) => {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
      });

      if (error) {
        throw new Error(error.message || 'Failed to resend OTP. Please try again.');
      }
    },
    onSuccess: () => {
      console.log('OTP resent successfully');
    },
    onError: (error: any) => {
      console.error('Resend OTP failed:', error);
    },
  });
};
