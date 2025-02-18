import React, { useState, memo } from 'react';
import { View, TouchableOpacity, Text, ActivityIndicator, Image } from 'react-native';
import { useUploadImage } from '~/hooks/query/useUpload';
import { imageUtils } from '~/utils/pickImages';
import { FontAwesome } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';

interface PickImageProps {
  onImageSelected: (publicUrl: string) => void;
  title?: string;
  buttonStyle?: string;
  showPreview?: boolean;
}

const PickImage = memo(
  ({ onImageSelected, title, buttonStyle = '', showPreview = true }: PickImageProps) => {
    const { mutate: uploadImage, isPending, isSuccess } = useUploadImage();
    const { pickImage } = imageUtils();
    const [imageUri, setImageUri] = useState<string | null>(null);

    const handlePickImage = async () => {
      try {
        const result = await pickImage();

        if (result.canceled || !result.assets?.[0]?.uri) return;

        const asset = result.assets[0];
        const uri = asset.uri;

        // Validate the URI
        if (!uri.startsWith('file://')) {
          throw new Error('Invalid file URI');
        }

        // Read the file as Base64
        const base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        // Upload the image
        uploadImage(base64, {
          onSuccess: (publicUrl) => {
            onImageSelected(publicUrl);
            setImageUri(publicUrl);
          },
          onError: (error) => {
            console.error('Upload error:', error);
          },
        });
      } catch (error) {
        console.error('Image picker error:', error);
      }
    };

    return (
      <View className="flex items-center">
        <TouchableOpacity
          className="h-10 w-full flex-row items-center justify-center gap-2 rounded-lg bg-white"
          onPress={!isPending ? handlePickImage : undefined}
          disabled={isPending}>
          {typeof title === 'string' ? (
            <Text className="text-bold text-center text-xs">
              Pick {!isPending && <FontAwesome name="image" size={15} color="black" />}
            </Text>
          ) : (
            title
          )}
          {isPending && <ActivityIndicator size="small" color="#1F355C" />}
        </TouchableOpacity>

        {showPreview && imageUri && (
          <Image source={{ uri: imageUri }} className="h-24 w-24 rounded-lg py-4" />
        )}
      </View>
    );
  }
);

export default PickImage;
