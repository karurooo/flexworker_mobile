import { supabase } from '~/services/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { getImage } from '~/services/api/storage/getImage';
import { useFileStore } from '~/store/files';

export const uploadImage = async () => {
  try {
    const { uri, filePath } = useFileStore.getState();

    if (!uri || !filePath) throw new Error('Missing file data');

    // Use optimized WebP image from picker
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { error } = await supabase.storage.from('user-images').upload(filePath, decode(base64), {
      contentType: 'image/webp',
      cacheControl: 'public, max-age=31536000', // 1 year cache
      upsert: true,
    });
    if (error) throw error;
    const { publicUrl } = await getImage();
    console.log('Public URL:', publicUrl);

    return publicUrl;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};
