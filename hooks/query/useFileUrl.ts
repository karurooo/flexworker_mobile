import { useQuery } from '@tanstack/react-query';
import { supabase } from '~/services/supabase';

export const useFileUrl = (filePath?: string) => {
  return useQuery({
    queryKey: ['document', filePath],
    queryFn: async () => {
      if (!filePath) throw new Error('No file path');

      const {
        data: { publicUrl },
      } = supabase.storage.from('user-documents').getPublicUrl(filePath);

      return publicUrl;
    },
    staleTime: 60 * 60 * 1000, // 1 hour cache
    enabled: !!filePath,
  });
};
