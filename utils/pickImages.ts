import * as ImagePicker from 'expo-image-picker';
import { useFileStore } from '~/store/files';
import { useUserStore } from '~/store/users';

export const imageUtils = () => {
  const pickImage = async (): Promise<ImagePicker.ImagePickerResult> => {
    try {
      const { setFileUri, setFileName, setFileType, setFilePath, setIsCanceled } =
        useFileStore.getState();
      const userId = useUserStore.getState().authID;

      // Reset isCanceled synchronously before proceeding
      setIsCanceled(false);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 4],
        quality: 1,
      });

      if (result.canceled) {
        console.log('Image picking was cancelled.');
        setIsCanceled(true);
        return result;
      }

      if (!result.assets || result.assets.length === 0) {
        throw new Error('No assets found in the result.');
      }

      const asset = result.assets[0];
      const uri = asset.uri;
      const type = asset.mimeType || '';
      const fileName = asset.fileName || '';
      const fullPath = `${userId}/${fileName}`;

      setFileUri(uri);
      setFileName(fileName);
      setFileType(type);
      setFilePath(fullPath);

      console.log('Image URI:', uri);
      console.log('Image Type:', type);
      console.log('Image File Name:', fileName);

      return result;
    } catch (error) {
      console.error('Error picking image:', error);
      throw error;
    }
  };

  return { pickImage };
};
