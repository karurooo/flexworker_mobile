import React, { forwardRef, useState } from 'react';
import { Pressable, PressableProps, Text, View } from 'react-native';
import { Link, Href } from 'expo-router';

type PressableTextProps = {
  children: React.ReactNode;
  href?: Href;
  textClassName?: string;
  onPress?: () => void;
  disabled?: boolean;
} & PressableProps;

const PressableText = forwardRef<View, PressableTextProps>(
  ({ children, href, textClassName = '', onPress, disabled, ...props }, ref) => {
    const [isPressed, setIsPressed] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const content = (
      <Pressable
        ref={ref}
        onPressIn={() => setIsPressed(true)}
        onPressOut={() => setIsPressed(false)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onPress={onPress}
        disabled={disabled}
        {...props}>
        <Text
          className={`text-center underline ${textClassName} ${
            disabled ? 'text-teal' : isPressed || isFocused ? 'text-gold' : 'text-black'
          }`}>
          {children}
        </Text>
      </Pressable>
    );

    return href ? (
      <Link href={href} asChild>
        {content}
      </Link>
    ) : (
      content
    );
  }
);

export default PressableText;
