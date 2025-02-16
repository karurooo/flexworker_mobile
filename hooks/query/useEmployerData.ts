import { useQuery } from '@tanstack/react-query';
import { getEmployerData } from '~/services/api/employers/employerDataApi';
import { useUserStore } from '~/store/users';
import { EMPLOYER_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserData } from './useUserData';
import { getEmployerStatus } from '~/services/api/employers/statusDataApi';

const useEmployerData = () => {
  const { isAuthenticated } = useUserStore();
  const { data: userData } = useUserData();
  const userId = userData?.id;

  return useQuery({
    queryKey: [EMPLOYER_DATA_QUERY_KEY, userId],
    queryFn: ({ queryKey }) => {
      const [, userId] = queryKey;
      return getEmployerData(userId as string);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};
const useEmployerStatus = () => {
  const { isAuthenticated } = useUserStore();
  const { data: employer } = useEmployerData();
  const employerId = employer?.id;

  return useQuery({
    queryKey: [EMPLOYER_DATA_QUERY_KEY, employerId],
    queryFn: ({ queryKey }) => {
      const [, employerId] = queryKey;
      return getEmployerStatus(employerId as string);
    },
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
};
export { useEmployerData, useEmployerStatus };
