import { forwardRef, useState } from 'react';
import { Text, TouchableOpacity, TouchableOpacityProps, View } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'warning';

const buttonVariants = {
  primary: 'bg-navy',
  secondary: 'bg-sky',
  warning: 'bg-gold',
  disabled: 'bg-gray-300',
} as const;

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: ButtonVariant;
  disabled?: boolean;
}

const Buttons = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', disabled, ...props }, ref) => {
    const currentVariant = disabled ? 'disabled' : variant;

    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        className={`my-4 h-11 w-full items-center justify-center rounded-xl ${buttonVariants[currentVariant]}`}
        {...props}>
        <Text className="text-center text-lg font-semibold text-white">{title}</Text>
      </TouchableOpacity>
    );
  }
);
export default Buttons;
