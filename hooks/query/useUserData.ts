import { useQuery } from '@tanstack/react-query';
import { userDataApi } from '~/services/api/users/userDataApi';
import { useUserStore } from '~/store/users';

export const USER_QUERY_KEY = ['user']; // Export as constant

const useUserData = () => {
  const { isAuthenticated } = useUserStore();

  return useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: userDataApi,
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};

export { useUserData };
