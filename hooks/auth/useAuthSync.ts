import { useQueryClient } from '@tanstack/react-query';
import { useUserStore } from '~/store/users';
import { useEffect } from 'react';
import { AUTH_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';

export const useAuthSync = () => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useUserStore();

  useEffect(() => {
    if (isAuthenticated) {
      queryClient.setQueryDefaults(AUTH_DATA_QUERY_KEY, {
        staleTime: 1000 * 60 * 60,
      });
    } else {
      queryClient.resetQueries({ queryKey: AUTH_DATA_QUERY_KEY });
      queryClient.removeQueries();
    }
  }, [isAuthenticated, queryClient]);
};
