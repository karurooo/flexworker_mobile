import React, { memo, useCallback } from 'react';
import { TouchableOpacity, Platform, InteractionManager } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useDerivedValue } from 'react-native-reanimated';

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
}

const ExtendedFab = memo(({ iconName, onPress, disabled = false }: ExtendedFabProps) => {
  const handlePress = useCallback(() => {
    requestAnimationFrame(() => {
      InteractionManager.runAfterInteractions(onPress);
    });
  }, [onPress]);

  return (
    <TouchableOpacity
      onPress={handlePress}
      activeOpacity={0.8}
      disabled={disabled}
      className="absolute bottom-14 right-4 h-14 w-14 items-center justify-center rounded-full bg-navy"
      style={[shadowStyle, { transform: [{ scale: 0.9 }] }]}
      hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
      <MaterialIcons
        name={iconName}
        size={24}
        color="white"
        style={{ opacity: disabled ? 0.5 : 1 }}
      />
    </TouchableOpacity>
  );
});

export default ExtendedFab;
