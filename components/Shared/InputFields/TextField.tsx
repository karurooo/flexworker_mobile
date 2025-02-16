import React, { useRef, useState, useCallback } from 'react';
import {
  Text,
  TextInput,
  View,
  TextInputProps,
  KeyboardTypeOptions,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputFocusEventData,
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
  onFocus?: () => void;
}

const TextField = React.forwardRef<TextInput, CustomTextFieldProps>(
  ({ label, error, onBlur, onFocus, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const handlePasswordToggle = useCallback(() => {
      setShowPassword((prev) => !prev);
    }, []);

    const handleFocus = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(true);
        onFocus?.();
      },
      [onFocus]
    );

    const handleBlur = useCallback(
      (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
        setIsFocused(false);
        onBlur?.();
      },
      [onBlur]
    );

    return (
      <View className="my-1">
        {label && <Text className={`mb-1 ${props.labelClassName}`}>{label}</Text>}
        <View className={`flex-row items-center rounded-lg `}>
          <TextInput
            ref={ref}
            onFocus={handleFocus}
            onBlur={handleBlur}
            className={`w-full rounded-lg px-4 py-3 
              ${isFocused ? 'border-2 border-black' : 'border border-gray-400'} 
             `}
            placeholder={props.placeholder}
            placeholderTextColor="#C0C0C0"
            {...props}
            secureTextEntry={props.isPassword && !showPassword}
            textContentType="none"
            returnKeyType="done"
            importantForAutofill="no"
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
        {error && (
          <Text className={`mt-1 text-sm text-red-500 ${props.errorClassName}`}>{error}</Text>
        )}
      </View>
    );
  }
);

export default TextField;
