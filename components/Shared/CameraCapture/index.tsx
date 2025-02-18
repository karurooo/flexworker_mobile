// components/Reusable/CameraCapture.tsx
import React, { useState, useEffect, memo } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image, Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { useUploadImage } from '~/hooks/query/useUpload';
import { useFileStore } from '~/store/files';
import { Entypo } from '@expo/vector-icons';
import Alert from '~/components/Shared/Alerts';
import * as FileSystem from 'expo-file-system';
import { useUserStore } from '~/store/users';

interface CameraCaptureProps {
  onImageCaptured: (publicUrl: string) => void;
  title?: string;
}

const CameraCapture = memo(({ onImageCaptured, title }: CameraCaptureProps) => {
  const { mutate: uploadImage, isPending } = useUploadImage();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [showPermissionAlert, setShowPermissionAlert] = useState(false);
  const [errorAlert, setErrorAlert] = useState({
    visible: false,
    message: '',
  });

  const requestCameraPermission = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        setShowPermissionAlert(true);
        return false;
      }
    }
    return true;
  };

  const handleTakePhoto = async () => {
    try {
      const fileStore = useFileStore.getState();
      fileStore.setIsCanceled(false);

      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 5],
        quality: 0.7,
        base64: false,
        exif: true,
      });

      if (!result.assets?.[0]?.uri) return;

      const asset = result.assets[0];
      const processedImage = await manipulateAsync(asset.uri, [{ resize: { width: 1080 } }], {
        compress: 0.7,
        format: SaveFormat.JPEG,
      });

      // Prepare file metadata for upload service
      const fileName = `photo_${Date.now()}.jpg`;
      const fullPath = `${useUserStore.getState().authID}/${fileName}`;

      // Update file store
      fileStore.setFileUri(processedImage.uri);
      fileStore.setFileName(fileName);
      fileStore.setFileType('image/jpeg');
      fileStore.setFilePath(fullPath);

      // Read the processed image
      const base64 = await FileSystem.readAsStringAsync(processedImage.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      uploadImage(base64, {
        onSuccess: (publicUrl) => {
          onImageCaptured(publicUrl);
          setImageUri(processedImage.uri);
        },
        onError: (error) => {
          console.error('Upload error:', error);
          setErrorAlert({
            visible: true,
            message: 'Failed to upload image. Please try again.',
          });
        },
      });
    } catch (error) {
      console.error('Camera error:', error);
      setErrorAlert({
        visible: true,
        message: 'Failed to process image. Please try again.',
      });
    }
  };

  useEffect(() => {
    return () => {
      if (imageUri) {
        FileSystem.deleteAsync(imageUri).catch(() => {});
      }
    };
  }, [imageUri]);

  return (
    <View className="flex">
      <TouchableOpacity
        className="h-10 w-full flex-row items-center justify-center gap-2 rounded-lg bg-white"
        onPress={!isPending ? handleTakePhoto : undefined}
        disabled={isPending}>
        <Text className="text-bold text-center text-xs ">
          Capture {isPending ? 'Processing...' : <Entypo name="camera" size={16} color="black" />}
        </Text>
        {isPending && <ActivityIndicator size="small" color="#1F355C" />}
      </TouchableOpacity>

      {showPermissionAlert && (
        <Alert
          isVisible={showPermissionAlert}
          variant="confirmation"
          title="Permission Required"
          message="Camera permission is required to take pictures."
          onClose={() => setShowPermissionAlert(false)}
        />
      )}

      {errorAlert.visible && (
        <Alert
          isVisible={errorAlert.visible}
          variant="error"
          title="Error"
          message={errorAlert.message}
          onClose={() => setErrorAlert({ visible: false, message: '' })}
        />
      )}

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={{ width: 100, height: 100, marginTop: 10 }}
          className="rounded-lg"
          resizeMode="cover"
        />
      )}
    </View>
  );
});

export default CameraCapture;
