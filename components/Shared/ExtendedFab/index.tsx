import React, { memo, useCallback, useState } from 'react';
import { TouchableOpacity, Platform, InteractionManager, View, Text } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDerivedValue } from 'react-native-reanimated';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

const shadowStyle = Platform.select({
  ios: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  android: { elevation: 5 },
});

interface ExtendedFabProps {
  iconName: keyof typeof MaterialIcons.glyphMap;
  onPress: () => void;
  disabled?: boolean;
  disabledHint?: string;
}

const ExtendedFab = memo(
  ({
    iconName,
    onPress,
    disabled = false,
    disabledHint = 'Action unavailable',
  }: ExtendedFabProps) => {
    const [showHint, setShowHint] = useState(false);

    const handlePress = useCallback(() => {
      if (disabled) {
        setShowHint(true);
        setTimeout(() => setShowHint(false), 2000); // Hide after 2 seconds
        return;
      }
      requestAnimationFrame(() => {
        InteractionManager.runAfterInteractions(onPress);
      });
    }, [onPress, disabled]);

    return (
      <View className="absolute bottom-4 right-4">
        <TouchableOpacity
          onPress={handlePress}
          activeOpacity={0.8}
          disabled={disabled}
          className={`absolute bottom-14 right-4 h-14 w-14 items-center justify-center rounded-full ${
            disabled ? 'bg-gray-400' : 'bg-navy'
          }`}
          style={[shadowStyle, { transform: [{ scale: 0.9 }] }]}
          hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
          <MaterialIcons
            name={iconName}
            size={24}
            color="white"
            style={{ opacity: disabled ? 0.5 : 1 }}
          />
        </TouchableOpacity>

        {showHint && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOut.duration(300)}
            className="absolute -top-12 right-2 rounded-lg bg-gray-700 px-3 py-2"
            style={{ elevation: 5 }}>
            <Text className="text-xs font-medium text-white">{disabledHint}</Text>
            <View
              className="absolute -bottom-1 right-3 h-3 w-3 bg-gray-700"
              style={{ transform: [{ rotate: '45deg' }] }}
            />
          </Animated.View>
        )}
      </View>
    );
  }
);

export default ExtendedFab;
