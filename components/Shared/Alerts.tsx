import AntDesign from '@expo/vector-icons/AntDesign';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import Button from '~/components/Shared/Buttons/Button';
import React from 'react';

interface AlertProps {
  variant?: 'success' | 'error' | 'confirmation' | 'info';
  title: string;
  message: string;
  isVisible: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  className?: string;
}

const variantConfig = {
  success: {
    icon: 'checkcircle' as const,
    iconColor: '#22C55E',
    bg: 'bg-green-50',
  },
  error: {
    icon: 'exclamationcircle' as const,
    iconColor: '#EF4444',
    bg: 'bg-red-50',
  },
  confirmation: {
    icon: 'questioncircle' as const,
    iconColor: '#8B5CF6',
    bg: 'bg-purple-50',
  },
  info: {
    icon: 'infocirlce' as const,
    iconColor: '#3B82F6',
    bg: 'bg-blue-50',
  },
};

const Alert = React.memo((props: AlertProps) => {
  const { variant = 'info', title, message, onClose, onConfirm } = props;
  const { icon, iconColor, bg } = variantConfig[variant];

  return (
    <Modal transparent={true} animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/40">
        <View className={`${bg} w-4/5 rounded-xl p-6 shadow-lg`}>
          <View className="items-center">
            <AntDesign name={icon} size={48} color={iconColor} />
            <Text className="mt-4 text-2xl font-bold text-gray-900">{title}</Text>
          </View>

          <Text className="mb-6 mt-4 text-center text-gray-600">{message}</Text>

          {variant === 'confirmation' ? (
            <View className="  items-center justify-between  ">
              <Button title="Confirm" onPress={onConfirm} variant="primary" />

              <Button title="Cancel" onPress={onClose} variant="secondary" />
            </View>
          ) : (
            <Button title="Close" onPress={onClose} variant="primary" />
          )}
        </View>
      </View>
    </Modal>
  );
});

export default Alert;
