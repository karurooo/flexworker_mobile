import { supabase } from '~/services/supabase';
import { useFileStore } from '~/store/files';

type PublicUrlResponse = {
  publicUrl: string;
};

export const getImage = async (): Promise<PublicUrlResponse> => {
  const filePath = useFileStore.getState().filePath;

  if (!filePath) {
    throw new Error('No file path available');
  }

  try {
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-images').getPublicUrl(filePath);

    console.log('Generated public URL:', publicUrl);
    return { publicUrl };
  } catch (error) {
    console.error('Failed to get image URL:', error);
    throw new Error('Image URL retrieval failed');
  }
};
