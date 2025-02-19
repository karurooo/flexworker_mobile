import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { View, Text, Image } from 'react-native';
import { Container } from '~/components/Shared/Container';
import Header from '~/components/Shared/Header';
import FormField from '~/components/Shared/Forms/FormFields';
import Checkbox from '~/components/Shared/Checkbox';
import Button from '~/components/Shared/Buttons/Button';
import Alerts from '~/components/Shared/Alerts';
import { useSignupMutation } from '~/mutations/auth/signup';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { signupSchema, SignupFormData } from '~/schema/authSchema';
import PressableText from '~/components/Shared/Buttons/PressableText';
import RoleSelector from '~/components/Shared/Forms/RoleSelector';
import Alert from '~/components/Shared/Alerts';

export default function Signup() {
  const [errorMessage, setErrorMessage] = useState('');
  const closeBottomSheet = useCallback(() => {
    setErrorMessage('');
  }, []);

  const formConfig = useMemo(
    () => ({
      resolver: zodResolver(signupSchema),
      mode: 'onBlur' as const,
      defaultValues: {
        email: '',
        password: '',
        confirm_password: '',
        first_name: '',
        last_name: '',
        agree_to_terms: false,
        role: undefined,
      },
      shouldUnregister: true,
    }),
    []
  );

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting, errors },
  } = useForm<SignupFormData>(formConfig);

  const { mutate, isPending, error } = useSignupMutation();
  const prevErrorMessageRef = useRef<string | null>(null);

  // Memoize error handling
  const handleError = useCallback((error: Error) => {
    if (error.message.includes('confirmation email')) {
      return 'We sent a confirmation email, but there was a delay. You can still proceed.';
    }
    return error.message;
  }, []);

  // Optimize useEffect error handling
  useEffect(() => {
    if (error && error.message !== prevErrorMessageRef.current) {
      setErrorMessage(handleError(error));
      prevErrorMessageRef.current = error.message;
    }
  }, [error, handleError]);

  // Memoize form submission handler
  const onSubmit = useCallback(
    (data: SignupFormData) => {
      mutate({
        email: data.email,
        password: data.password,
        firstName: data.first_name,
        lastName: data.last_name,
        role: data.role,
      });
    },
    [mutate]
  );

  // Memoize button title
  const buttonTitle = useMemo(() => (isPending ? 'Signing Up...' : 'Sign Up'), [isPending]);

  // Add memoized Alert component
  const MemoizedAlert = React.memo(Alert);

  // Update error handling
  const handleCloseAlert = useCallback(() => setErrorMessage(''), []);

  return (
    <Container scrollable>
      <View className="h-[15%] bg-white">
        <View className="h-full justify-center rounded-br-[75px] bg-navy px-4">
          <Header />
        </View>
      </View>
      <View className="mx-4 h-[85%] flex-1">
        {errorMessage && (
          <MemoizedAlert
            isVisible={!!errorMessage}
            variant="error"
            title="Signup Issue"
            message={errorMessage}
            onClose={handleCloseAlert}
            className="mb-4"
          />
        )}
        <View className="my-2">
          <Text className="text-3xl font-bold ">Create an account</Text>
          <Text className="text-lg  text-gray-800">Enter your account details to get started</Text>
        </View>
        <View className="mb-10 mt-2">
          {/* Role Selector */}
          <MemoizedRoleSelector control={control} error={errors.role?.message} />

          {/* Form Fields */}
          {['first_name', 'last_name', 'email', 'password', 'confirm_password'].map((name) => (
            <MemoizedFormField
              key={name}
              control={control}
              name={name}
              label={name
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              placeholder={name
                .split('_')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
              isPassword={name.includes('password')}
            />
          ))}
          {/* Agree to Terms Checkbox */}
          <Controller
            control={control}
            name="agree_to_terms"
            render={({ field: { onChange, value } }) => (
              <MemoizedCheckbox
                isChecked={value}
                onToggle={() => onChange(!value)}
                label="By signing up, you agree to our Terms of Service and Privacy Policy"
                error={errors.agree_to_terms?.message}
              />
            )}
          />
          {/* Submit Button */}
          <Button
            title={buttonTitle}
            onPress={handleSubmit(onSubmit)}
            disabled={isPending || !isValid || isSubmitting}
          />
          <View className="flex-row justify-center gap-1">
            <Text className="font-Poppins text-center">Already have an account?</Text>
            <PressableText href="/auth/signin">Sign In</PressableText>
          </View>
        </View>
      </View>
    </Container>
  );
}

// Create memoized version of components
const MemoizedFormField = React.memo(FormField);
const MemoizedCheckbox = React.memo(Checkbox);
const MemoizedRoleSelector = React.memo(RoleSelector);
