import React, { useEffect } from 'react';
import { KeyboardAvoidingView, SafeAreaView, View, Platform } from 'react-native';
import Animated, { useSharedValue, withTiming, useAnimatedStyle } from 'react-native-reanimated';

interface ContainerProps {
  children: React.ReactNode;
  scrollable?: boolean; // Whether the container should be scrollable
}

export const Container = ({ children, scrollable = false }: ContainerProps) => {
  // Shared value for fade-in animation
  const opacity = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // Trigger fade-in animation on mount
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 }); // Smooth fade-in over 300ms
  }, []);

  return (
    <SafeAreaView className="flex-1 ">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1">
        {scrollable ? (
          <Animated.ScrollView
            style={[{ flex: 1 }, animatedStyle]}
            contentContainerStyle={{ flexGrow: 1 }}
            keyboardShouldPersistTaps="handled">
            {children}
          </Animated.ScrollView>
        ) : (
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>{children}</Animated.View>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};
