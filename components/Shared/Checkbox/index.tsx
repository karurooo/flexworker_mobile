import React from 'react';
import { Pressable, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useAnimatedReaction,
} from 'react-native-reanimated';

type CheckboxProps = {
  isChecked: boolean;
  onToggle: () => void;
  label?: string;
  error?: string;
  errorClassName?: string;
};

const Checkbox = React.memo(
  ({ isChecked, onToggle, label, error, errorClassName = '' }: CheckboxProps) => {
    const progress = useSharedValue(isChecked ? 1 : 0);

    useAnimatedReaction(
      () => isChecked,
      (result) => {
        progress.value = withTiming(result ? 1 : 0, { duration: 200 });
      }
    );

    const checkmarkStyle = useAnimatedStyle(() => ({
      opacity: progress.value,
      transform: [{ scale: progress.value }],
    }));

    const borderStyle = useAnimatedStyle(() => ({
      borderColor: progress.value ? '#000' : '#c0c0c0',
    }));

    return (
      <>
        <Pressable onPress={onToggle} className="my-2 flex-row items-center">
          <Animated.View
            style={borderStyle}
            className="h-6 w-6 items-center justify-center rounded-md border-2">
            <Animated.View style={checkmarkStyle} className="h-3 w-3 rounded-sm bg-navy" />
          </Animated.View>
          {label && <Text className="mx-4 ">{label}</Text>}
        </Pressable>
        {error && <Text className={`mt-1 text-sm text-red-500 ${errorClassName}`}>{error}</Text>}
      </>
    );
  }
);

export default Checkbox;
