import { useQuery } from '@tanstack/react-query';
import { getEmployerData } from '~/services/api/employers/employerDataApi';
import { useUserStore } from '~/store/users';
import { EMPLOYER_DATA_QUERY_KEY, JOB_SEEKER_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserData } from './useUserData';
import {
  getJobseekerData,
  getJobSeekerSkillsData,
} from '~/services/api/jobseekers/jobseekerDataApi';

const useJobseekerData = () => {
  const { data: user } = useUserData();
  const userId = user?.id;

  return useQuery({
    queryKey: [JOB_SEEKER_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const data = await getJobseekerData(userId);
      return {
        ...data,
        isNewUser: !data, // Flag new users
      };
    },
    enabled: !!userId, // Only run when user is logged in
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

const useJobSeekerSkillsData = () => {
  const { data: user } = useUserData();
  const userId = user?.id;

  return useQuery({
    queryKey: [JOB_SKILLS_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) throw new Error('User not authenticated');

      const data = await getJobSeekerSkillsData(userId);
      return data; // Ensure this returns an array of skills
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5,
  });
};

// const useEmployerStatus = () => {
//   const { isAuthenticated } = useUserStore();
//   const { data: employer } = useJobseekerData();
//   const employerId = employer?.id;

//   return useQuery({
//     queryKey: [EMPLOYER_DATA_QUERY_KEY, employerId],
//     queryFn: ({ queryKey }) => {
//       const [, employerId] = queryKey;
//       return getEmployerStatus(employerId as string);
//     },
//     enabled: isAuthenticated,
//     staleTime: 1000 * 60 * 5,
//   });
// };
export { useJobseekerData, useJobSeekerSkillsData };

export const JOB_SKILLS_QUERY_KEY = ['jobSeekerSkills'];
