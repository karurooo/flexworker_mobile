import React from 'react';
import { Controller } from 'react-hook-form';
import TextField from '~/components/InputFields/TextField';
import { KeyboardTypeOptions } from 'react-native';

interface FormFieldProps {
  control: any; // Replace `any` with `Control<any>` for better type safety
  name: string;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  isPassword?: boolean;
  maxLength?: number; // Add this if needed for specific fields like OTP
}

const FormField = React.memo((props: FormFieldProps) => {
  const {
    name,
    label,
    control,
    placeholder,
    keyboardType = 'default',
    isPassword,
    maxLength,
  } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          label={label}
          value={field.value}
          onChangeText={field.onChange}
          onBlur={field.onBlur}
          placeholder={placeholder || label}
          keyboardType={keyboardType}
          isPassword={isPassword}
          maxLength={maxLength}
          error={fieldState.error?.message}
        />
      )}
    />
  );
});

export default FormField;
