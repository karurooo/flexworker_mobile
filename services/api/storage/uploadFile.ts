import { supabase } from '~/services/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';

type FileParams = {
  uri: string;
  fileType: string;
  filePath: string;
};

export const uploadFile = async ({ uri, fileType, filePath }: FileParams) => {
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const { data, error } = await supabase.storage
      .from('user-documents')
      .upload(filePath, decode(base64), {
        contentType: fileType,
        upsert: true,
      });

    if (error) throw error;

    // Direct URL generation
    const {
      data: { publicUrl },
    } = supabase.storage.from('user-documents').getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
};
