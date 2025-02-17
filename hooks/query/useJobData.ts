import { useUserStore } from '~/store/users';
import { useUserData } from './useUserData';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { EMPLOYER_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';
import { getEmployerData } from '~/services/api/employers/employerDataApi';
import { getMatchedJobs } from '~/services/api/jobseekers/jobsDataApi';
import {
  getAcceptedApplicants,
  getPostByEmployer,
  getTotalApplicants,
  getTotalJobPosts,
} from '~/services/api/employers/jobPostDataApi';
import { JobPost } from '~/types/employers';

const useJobsData = () => {
  const queryClient = useQueryClient();
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

const useMatchJobs = (industry?: string) => {
  const { data: userId } = useUserData();
  return useQuery({
    queryKey: ['matchedJobs', userId.id, industry],
    queryFn: () => getMatchedJobs(userId.id!),
    staleTime: 5 * 60 * 1000,
    enabled: !!userId && !!industry,
    select: (data: JobPost[]) => ({
      data: data.filter((item: JobPost) => item.min_salary > 0),
    }),
  });
};

const usePostedJobs = (employerId: string) => {
  return useQuery<JobPost[]>({
    queryKey: ['employerJobs', employerId],
    queryFn: () => getPostByEmployer(employerId),
    enabled: !!employerId,
    select: (data) => data.filter((p) => !!p.id && !!p.created_at),
  });
};

const useTotalApplicants = (employerId: string) => {
  return useQuery({
    queryKey: ['totalApplicants', employerId], // Add employerId to key for caching
    queryFn: () => getTotalApplicants(employerId),
    enabled: !!employerId, // Prevents query from running if employerId is undefined
  });
};

const useTotalPostedJobs = (employerId: string) => {
  return useQuery({
    queryKey: ['totalPostedJobs', employerId],
    queryFn: () => getTotalJobPosts(employerId),
    enabled: !!employerId,
  });
};

const useAcceptedApplicants = (employerId: string) => {
  return useQuery({
    queryKey: ['totalAcceptedApplicantsByEmployer', employerId],
    queryFn: () => getAcceptedApplicants(employerId),
    enabled: !!employerId, // Prevents query from running if employerId is undefined
  });
};
export {
  useJobsData,
  useMatchJobs,
  usePostedJobs,
  useTotalApplicants,
  useTotalPostedJobs,
  useAcceptedApplicants,
};
