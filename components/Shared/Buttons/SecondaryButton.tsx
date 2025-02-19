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

const SecondaryButtons = forwardRef<View, ButtonProps>(
  ({ title, variant = 'primary', disabled, ...props }, ref) => {
    return (
      <TouchableOpacity
        ref={ref}
        disabled={disabled}
        className={`my-2 h-10 w-full items-center justify-center rounded-xl bg-white`}
        {...props}>
        <Text className="text-center text-sm font-semibold">{title}</Text>
      </TouchableOpacity>
    );
  }
);
export default SecondaryButtons;
