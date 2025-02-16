import { useQuery } from '@tanstack/react-query';
import { useFileStore } from '~/store/files';
import { getImage } from '~/services/api/storage/getImage';

export const useImageUrl = () => {
  const filePath = useFileStore.getState().filePath;

  return useQuery({
    queryKey: ['image', filePath],
    queryFn: () => getImage(), // Reuse service function
    staleTime: 60 * 60 * 1000, // Cache for 1 hour
    enabled: !!filePath,
  });
};
