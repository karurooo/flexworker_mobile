import { useUserStore } from '~/store/users';
import * as DocumentPicker from 'expo-document-picker';
import { uploadFile } from '~/services/api/storage/uploadFile';

export const fileUtils = () => {
  const pickDocument = async () => {
    try {
      const userId = useUserStore.getState().authID;
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return null;

      const asset = result.assets[0];
      const fullPath = `${userId}/${asset.name}`;

      // Direct upload with parameters
      const publicUrl = await uploadFile({
        uri: asset.uri,
        fileType: asset.mimeType || 'application/octet-stream',
        filePath: fullPath,
      });

      return { ...asset, publicUrl };
    } catch (error) {
      console.error('Document pick error:', error);
      return null;
    }
  };

  return { pickDocument };
};
