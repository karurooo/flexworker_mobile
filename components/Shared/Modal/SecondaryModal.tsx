import React, { memo } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useSharedValue, withSpring } from 'react-native-reanimated';

interface SecondaryModalProps {
  visible: boolean;
  onClose: () => void;
  children?: React.ReactNode;
  avoidKeyboard?: boolean;
  onCancel?: () => void;
  onConfirm?: () => void;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}

const SecondaryModal: React.FC<SecondaryModalProps> = memo(
  ({
    visible,
    onClose,
    avoidKeyboard = true,
    children,
    onCancel,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
  }) => {
    const scale = useSharedValue(0.8);
    const opacity = useSharedValue(0);

    const animateIn = () => {
      scale.value = withSpring(1, { damping: 10 });
      opacity.value = withSpring(1, { damping: 10 });
    };

    const animateOut = () => {
      scale.value = withSpring(0.8, { damping: 10 });
      opacity.value = withSpring(0, { damping: 10 });
    };

    const isConfirmationModal = title && message && onConfirm;

    return (
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        animationInTiming={400}
        animationOutTiming={400}
        useNativeDriver
        avoidKeyboard={avoidKeyboard}
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
        className="m-0 justify-center">
        <View className="items-center justify-center ">
          <View className="h-3/4 w-[90%] rounded-xl bg-gray-100 p-5 shadow-lg">
            <TouchableOpacity
              className="absolute right-3 top-3 z-10 p-1"
              onPress={onClose}
              activeOpacity={0.7}>
              <Ionicons name="close" size={24} color="black" />
            </TouchableOpacity>

            {isConfirmationModal ? (
              <View className="flex-1 items-center justify-center">
                <Text className="mb-4 text-center text-xl font-bold">{title}</Text>
                <Text className="mb-8 text-center text-base">{message}</Text>

                <View className="w-full flex-row justify-center space-x-4">
                  <TouchableOpacity
                    onPress={onCancel || onClose}
                    className="rounded-lg bg-gray-300 px-5 py-3">
                    <Text className="text-center font-semibold">{cancelText}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={onConfirm} className="bg-primary rounded-lg px-5 py-3">
                    <Text className="text-center font-semibold">{confirmText}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <View className="pt-2">
                {React.isValidElement(children)
                  ? React.cloneElement(children as React.ReactElement, { onClose })
                  : children}
              </View>
            )}
          </View>
        </View>
      </Modal>
    );
  }
);

export default SecondaryModal;
