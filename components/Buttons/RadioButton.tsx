import React, { useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';

interface RadioProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  error?: string;
  errorClassName?: string;
}

const RadioButton: React.FC<RadioProps> = ({
  label,
  selected,
  onPress,
  error,
  errorClassName = '',
}) => {
  const scale = useSharedValue(selected ? 1 : 0);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: withSpring(scale.value) }],
    };
  });

  useEffect(() => {
    scale.value = selected ? 1 : 0;
  }, [selected]);

  return (
    <View className="flex-row items-center">
      <Pressable onPress={onPress} className="my-2 flex-row items-center ">
        <View className="h-6 w-6 items-center justify-center rounded-full border-2 border-black">
          <Animated.View style={animatedStyle} className="h-3 w-3 rounded-full bg-navy " />
        </View>
        <Text className="ml-2 text-lg ">{label}</Text>
      </Pressable>
    </View>
  );
};

export default RadioButton;
