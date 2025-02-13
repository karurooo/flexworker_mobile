import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { View, Text, TouchableOpacity } from 'react-native';
import FormField from '~/components/Forms/FormFields';
import Alert from '~/components/Shared/Alerts';
import { useVerificationMutation } from '~/mutations/auth/verification';
import { VerificationFormData } from '~/schema/authSchema';
import { resendOtp } from '~/services/api/authApi';
import { useLocalSearchParams } from 'expo-router';
import { Container } from '~/components/Shared/Container';
import Header from '~/components/Header';
import Button from '~/components/Buttons/Button';

const Verification = () => {
  const { control, handleSubmit } = useForm<VerificationFormData>();
  const [timer, setTimer] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [successResent, setSuccessResent] = useState(false);
  const { mutateAsync, isPending } = useVerificationMutation();

  const { email, firstName, lastName, role } = useLocalSearchParams<{
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  }>();

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerification = async (data: VerificationFormData) => {
    setShowAlert(false);
    try {
      const result = await mutateAsync({
        email: String(email),
        otp: data.otp,
        firstName: String(firstName),
        lastName: String(lastName),
        role: String(role),
      });

      if (result?.success) {
        setSuccessMessage('Account verified successfully!');
        setShowAlert(true);
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? getFriendlyMessage(err.message) : 'Verification failed';

      setError(errorMessage);
      setShowAlert(true);
    }
  };

  const getFriendlyMessage = (msg: string) => {
    if (msg.includes('Invalid verification code')) return 'Invalid code';
    if (msg.includes('session expired')) return 'Session expired';
    if (msg.includes('Contact support')) return msg;
    return 'Verification failed. Try again';
  };

  const handleResendOtp = async () => {
    try {
      if (!email) {
        setError('No email found. Please restart verification');
        setShowAlert(true);
        return;
      }

      await resendOtp(String(email));
      setTimer(60);
      setCanResend(false);
      setSuccessResent(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? getResendErrorMessage(err.message) : 'Failed to resend OTP';

      setError(errorMessage);
      setShowAlert(true);
    }
  };

  const getResendErrorMessage = (msg: string) => {
    if (msg.includes('email address')) return 'Invalid email format';
    if (msg.includes('already verified')) return 'Account already verified';
    return 'Failed to resend OTP. Try again later';
  };

  const handleCloseAlert = () => {
    setShowAlert(false);
    setSuccessMessage(null);
    setError(null);
  };

  return (
    <Container scrollable={true}>
      <View className="h-[15%] bg-white">
        <View className="h-full justify-center rounded-br-[75px] bg-navy px-4">
          <Header />
        </View>
      </View>
      <View className="mx-4 h-[85%] flex-1">
        {successResent && (
          <Alert
            title="OTP Resent"
            message="New OTP has been sent to your email"
            variant="success"
            onClose={() => setSuccessResent(false)}
            className="mb-4"
          />
        )}

        <View className="my-4">
          <Text className="text-3xl font-bold">Verify Account</Text>
          <Text className="mb-6 text-gray-800">
            Enter the 6-digit code that has been sent to{' '}
            <Text className="font-semibold">{email}</Text>
          </Text>

          <FormField
            control={control}
            name="otp"
            label="Verification Code"
            keyboardType="number-pad"
            maxLength={6}
          />

          <Button
            variant="primary"
            title="Verify Account"
            onPress={handleSubmit(handleVerification)}
            disabled={isPending}
          />
        </View>

        <View className=" items-center">
          <Text className="text-gray-600">
            Didn't receive code?{' '}
            {canResend ? (
              <Text className="text-blue-500" onPress={handleResendOtp}>
                Resend
              </Text>
            ) : (
              <Text className="text-gray-400">
                Resend in 00:{timer.toString().padStart(2, '0')}
              </Text>
            )}
          </Text>
        </View>
      </View>
      {showAlert && (
        <Alert
          title={error ? 'Error' : 'Success'}
          message={error || successMessage || ''}
          variant={error ? 'error' : 'success'}
          onClose={handleCloseAlert}
          className="mb-4"
        />
      )}
    </Container>
  );
};

export default Verification;
