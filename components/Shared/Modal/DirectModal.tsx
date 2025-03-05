import React from 'react';
import { Modal, View, TouchableOpacity, StyleSheet } from 'react-native';
import { AntDesign } from '@expo/vector-icons';

interface DirectModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const DirectModal: React.FC<DirectModalProps> = ({ visible, onClose, children }) => {
  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.content}>{children}</View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '90%',
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10,
    padding: 5,
  },
  content: {
    flex: 1,
    width: '100%',
    paddingTop: 50, // Space for the close button
    paddingHorizontal: 20,
  },
});

export default DirectModal;

interface CoverLetterModalProps {
  isVisible: boolean;
  onClose: () => void;
  data: string | null | undefined;
}

export function CoverLetterModal({ isVisible, onClose, data }: CoverLetterModalProps) {
  return (
    <Modal visible={isVisible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <AntDesign name="close" size={24} color="black" />
          </TouchableOpacity>
          <View style={styles.content}>
            {/* Actual content of the cover letter should be rendered here */}
            {data}
          </View>
        </View>
      </View>
    </Modal>
  );
}
