import React, { useRef, useState, useCallback } from 'react';
import {
  Text,
  TextInput,
  View,
  TextInputProps,
  KeyboardTypeOptions,
  TouchableOpacity,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface CustomTextFieldProps extends TextInputProps {
  label?: string;
  error?: string;
  isPassword?: boolean;
  keyboardType?: KeyboardTypeOptions;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  errorClassName?: string;
  onBlur?: () => void;
}

const TextField = React.memo((props: CustomTextFieldProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<TextInput>(null);

  const handlePasswordToggle = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <View className="my-1">
      {props.label && <Text className={`mb-1 ${props.labelClassName}`}>{props.label}</Text>}
      <View className={`flex-row items-center rounded-lg border`}>
        <TextInput
          ref={inputRef}
          onBlur={() => {
            setIsFocused(false);
            props.onBlur?.();
          }}
          onFocus={() => setIsFocused(true)}
          className={`w-full rounded-lg border px-4 py-3 
            ${props.error ? 'border-2 border-red-500' : 'border-gray-300'}
            ${isFocused && 'border-2 border-gray-800'}
            ${props.inputClassName}`}
          placeholderTextColor="#C0C0C0"
          {...props}
          secureTextEntry={props.isPassword && !showPassword}
        />
        {props.isPassword && (
          <TouchableOpacity className="absolute right-3" onPress={handlePasswordToggle}>
            <MaterialIcons
              name={showPassword ? 'visibility' : 'visibility-off'}
              size={24}
              color="#7e7e7e"
            />
          </TouchableOpacity>
        )}
      </View>
      {props.error && (
        <Text className={`mt-1 text-sm text-red-500 ${props.errorClassName}`}>{props.error}</Text>
      )}
    </View>
  );
});

export default TextField;
