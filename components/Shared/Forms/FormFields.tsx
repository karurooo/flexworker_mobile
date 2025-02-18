import React from 'react';
import { Control, Controller } from 'react-hook-form';
import TextField from '~/components/Shared/InputFields/TextField';
import { KeyboardTypeOptions } from 'react-native';

interface FormFieldProps {
  control: Control<any>;
  name: string;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  isPassword?: boolean;
  maxLength?: number;
  error?: string;
  multiline?: boolean;
  numberOfLines?: number;
  onChangeText?: (text: string) => void;
  value?: string;
}

const areEqual = (prev: FormFieldProps, next: FormFieldProps) =>
  prev.name === next.name && prev.control === next.control && prev.error === next.error;

const FormField = React.memo((props: FormFieldProps) => {
  const { name, control, onChangeText, ...rest } = props;

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <TextField
          {...rest}
          value={field.value}
          onChangeText={(text) => {
            field.onChange(text);
            onChangeText?.(text);
          }}
          onBlur={field.onBlur}
          error={fieldState.error?.message}
          placeholder={rest.placeholder}
          placeholderTextColor={rest.placeholder ? '#C0C0C0' : undefined}
        />
      )}
    />
  );
}, areEqual);

export default FormField;
