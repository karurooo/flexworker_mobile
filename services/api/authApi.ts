import { SigninFormData, VerificationFormData } from '~/schema/authSchema';
import { supabase } from '~/services/supabase';
import { getSession, setSession } from '~/services/supabase/session';

interface SignupData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface VerifyOtpInput {
  email: string;
  otp: string;
  firstName: string;
  lastName: string;
  role: string;
}

export const signup = async ({ email, password, firstName, lastName, role }: SignupData) => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role,
        },
      },
    });

    if (authError) {
      throw new Error(authError.message);
    }

    if (!authData.user?.id) {
      throw new Error('User ID is missing. Unable to proceed.');
    }

    return { success: true, user: authData.user };
  } catch (error) {
    console.error('Signup error:', error);
    throw error;
  }
};

export const verificationOtp = async ({
  email,
  otp,
  firstName,
  lastName,
  role,
}: VerifyOtpInput) => {
  try {
    console.log(email, otp, firstName, lastName, role);
    // 1. Verify OTP
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otp,
      type: 'signup',
    });

    if (verifyError) throw new Error('Invalid verification code');

    // 2. Only proceed if user exists
    if (!data.user?.id) throw new Error('User session expired');

    // 3. Insert into users table
    const { error: insertError } = await supabase.from('users').insert([
      {
        user_id: data.user.id,
        first_name: firstName,
        last_name: lastName,
        role: role,
      },
    ]);

    if (insertError) {
      console.error('DB Insert Error:', insertError);
      throw new Error('Account setup failed. Contact support');
    }

    return { success: true, user: data.user };
  } catch (error) {
    console.error('Verification Error:', error);
    throw new Error(error instanceof Error ? error.message : 'Verification failed');
  }
};

export const signin = async ({ email, password }: SigninFormData) => {
  try {
    const { data: userData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    await setSession('session', userData?.session.access_token);

    const userSession = await getSession('session');
    console.log('User session is:', userSession);

    return { success: true, user: userData?.user };
  } catch (error) {
    console.error('Signin error:', error);
    throw error;
  }
};

export const resendOtp = async (email: string) => {
  console.log('Resending OTP to:', email);
  try {
    const { error } = await supabase.auth.resend({
      email,
      type: 'signup',
    });

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error) {
    console.log('Resend OTP error:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to resend OTP');
  }
};
