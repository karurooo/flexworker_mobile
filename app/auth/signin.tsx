import React, { useState, useCallback, useRef, useEffect } from 'react';
import { View, Text, Pressable } from 'react-native';
import Button from '~/components/Shared/Buttons/Button';
import { Container } from '~/components/Shared/Container';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signinSchema, SigninFormData } from '~/schema/authSchema';
import FormField from '~/components/Shared/Forms/FormFields';
import { useSigninMutation } from '~/mutations/auth/signin';
import PressableText from '~/components/Shared/Buttons/PressableText';
import Header from '~/components/Shared/Header';
import Alert from '~/components/Shared/Alerts';

export default function Signin() {
  const [errorMessage, setErrorMessage] = useState('');

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SigninFormData>({
    resolver: zodResolver(signinSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const { mutate, isPending, error: mutationError } = useSigninMutation();

  useEffect(() => {
    if (mutationError) {
      const message = mutationError.message.replace(/\.$/, '');
      setErrorMessage(`${message}. Please try again or contact support if it persists.`);
    }
  }, [mutationError]);

  const onSubmit = (data: SigninFormData) => {
    mutate({
      email: data.email,
      password: data.password,
    });
  };

  return (
    <Container scrollable={true}>
      <View className="h-[15%] bg-white">
        <View className="h-full justify-center rounded-br-[75px] bg-navy px-4">
          <Header />
        </View>
      </View>
      <View className="m-4 h-5/6 flex-1 ">
        <Text className="text-3xl font-bold ">Welcome!</Text>
        <Text className="text-lg text-gray-800">Signin your account to continue</Text>

        {errorMessage && (
          <Alert
            isVisible={!!errorMessage}
            variant="error"
            title="Sign In Issue"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
            className="mb-4"
          />
        )}

        <View className="my-4">
          <FormField
            control={control}
            name="email"
            label="Email"
            keyboardType="email-address"
            placeholder="Enter your email"
          />
          <FormField
            control={control}
            name="password"
            label="Password"
            isPassword
            placeholder="Enter your password"
          />
          <View className="h-2/3 justify-between ">
            {/* Submit Button */}
            <View className="flex-1">
              <Button
                title={isPending ? 'Signing In...' : 'Sign In'}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
              />
              <PressableText href="/auth/forgot-password">Forgot Password</PressableText>
            </View>
            <View className="my-2 flex-row justify-center gap-1">
              <Text className="font-Poppins text-center ">Don't have an account?</Text>
              <PressableText href="/auth/signup">Sign Up</PressableText>
            </View>
          </View>
        </View>
      </View>
    </Container>
  );
}
