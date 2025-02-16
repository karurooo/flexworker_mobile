import Ionicons from '@expo/vector-icons/Ionicons';
import React, { memo } from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Modal from 'react-native-modal';

interface PrimaryModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  avoidKeyboard?: boolean;
}

const PrimaryModal: React.FC<PrimaryModalProps> = memo(
  ({ visible, onClose, avoidKeyboard = true, children }) => {
    return (
      <Modal
        isVisible={visible}
        onBackdropPress={onClose}
        onBackButtonPress={onClose}
        animationIn="slideInUp"
        animationOut="slideOutDown"
        useNativeDriver
        avoidKeyboard={avoidKeyboard}
        hideModalContentWhileAnimating={true}
        backdropTransitionOutTiming={0}>
        <View className="flex-1 overflow-hidden rounded-lg bg-white p-5">
          {/* Close Button */}
          <TouchableOpacity
            style={{ position: 'absolute', top: 10, right: 10, zIndex: 1 }}
            onPress={onClose}>
            <Ionicons name="close" size={20} color="black" />
          </TouchableOpacity>

          {/* Render Children Without ScrollView */}
          <View style={{ flex: 1 }}>
            {React.isValidElement(children)
              ? React.cloneElement(children as React.ReactElement, { onClose })
              : children}
          </View>
        </View>
      </Modal>
    );
  }
);

export default PrimaryModal;
