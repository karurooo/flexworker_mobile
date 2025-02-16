import { useUserStore } from '~/store/users';
import { useUserData } from './useUserData';
import { useQuery } from '@tanstack/react-query';
import { ANNOUNCEMENT_QUERY_KEY } from '~/constants/auth/queryKeys';
import { getAnnouncement } from '~/services/api/employers/announcement';

const useAnnouncementData = () => {
  const { isAuthenticated } = useUserStore();
  const { data: userData } = useUserData();
  const userId = userData?.id;

  return useQuery({
    queryKey: [ANNOUNCEMENT_QUERY_KEY, userId],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getAnnouncement(userId);
    },
    enabled: isAuthenticated && !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

export { useAnnouncementData };
