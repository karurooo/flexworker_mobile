// hooks/query/useUpload.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/services/supabase';
import { decode } from 'base64-arraybuffer';
import * as FileSystem from 'expo-file-system';
import { useFileStore } from '~/store/files';
import { uploadImage } from '~/services/api/storage/uploadImage';
import { useQuery } from '@tanstack/react-query';

// Define the return type of the upload functions
type UploadResponse = {
  id: string;
  path: string;
  fullPath: string;
};

export const useUploadImage = () => {
  return useMutation<string, Error, string>({
    mutationFn: async (base64) => {
      const fileStore = useFileStore.getState();
      const filePath = fileStore.filePath || `user-images/${Date.now()}.webp`;

      if (!fileStore.filePath) {
        fileStore.setFilePath(filePath);
      }

      const { error } = await supabase.storage
        .from('user-images')
        .upload(filePath, decode(base64), {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000',
          upsert: true,
        });

      if (error) throw error;

      const publicUrl = await uploadImage();
      return publicUrl;
    },
  });
};

export const useUploadFile = () => {
  return useMutation<string, Error, void>({
    mutationFn: async () => {
      const uri = useFileStore.getState().uri;
      const fileType = useFileStore.getState().type;
      const filePath = useFileStore.getState().filePath;

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from('user-documents')
        .upload(filePath, decode(base64), {
          contentType: fileType,
          upsert: true,
        });

      if (error) {
        throw new Error(error.message);
      }

      // Get the public URL of the uploaded file
      const { data: publicUrlData } = supabase.storage
        .from('user-documents')
        .getPublicUrl(filePath);

      return publicUrlData.publicUrl; // Return the public URL as a string
    },
  });
};
