import { supabase } from '~/services/supabase';

export const getFileUrl = (filePath: string) => {
  const {
    data: { publicUrl },
  } = supabase.storage.from('user-documents').getPublicUrl(filePath);

  return publicUrl;
};
