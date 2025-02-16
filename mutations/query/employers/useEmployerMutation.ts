import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postEmployerData,
  postGovernmentData,
  postSoleProprietorshipData,
  postCorporationData,
} from '~/services/api/employers/employerDataApi';
import {
  EMPLOYER_DATA_QUERY_KEY,
  CORPORATION_DATA_QUERY_KEY,
  JOB_POST_QUERY_KEY,
} from '~/constants/auth/queryKeys';
import { useUserData } from '~/hooks/query/useUserData';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import {
  CorporationDocumentData,
  GovernmentDocumentData,
  JobPostingFormData,
  SoleProprietorshipDocumentData,
} from '~/schema/employerSchema';
import { postJob } from '~/services/api/employers/jobPostDataApi';

// Main employer mutation
export const useEmployerMutation = () => {
  const queryClient = useQueryClient();
  const { data: userData } = useUserData();
  const userId = userData?.id;

  return useMutation({
    mutationFn: (employerData: Parameters<typeof postEmployerData>[0]) => {
      if (!userId) throw new Error('User not authenticated');
      return postEmployerData(employerData, userId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EMPLOYER_DATA_QUERY_KEY, userId],
      });
    },
    onError: (error: Error) => {
      console.error('Employer submission failed:', error.message);
    },
  });
};

// Government documents mutation
export const useGovernmentMutation = () => {
  const queryClient = useQueryClient();
  const { data: employer } = useEmployerData();

  return useMutation({
    mutationFn: (data: GovernmentDocumentData) => {
      if (!employer?.id) throw new Error('User not authenticated');
      return postGovernmentData(employer.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYER_DATA_QUERY_KEY,
      });
    },
    onError: (error) => {
      console.error('Submission failed:', error.message);
    },
  });
};

// Sole proprietorship mutation
export const useSoleProprietorshipMutation = () => {
  const queryClient = useQueryClient();
  const { data: employer } = useEmployerData();

  return useMutation({
    mutationFn: (data: SoleProprietorshipDocumentData) => {
      if (!employer?.id) throw new Error('User not authenticated');
      return postSoleProprietorshipData(employer.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: EMPLOYER_DATA_QUERY_KEY,
      });
    },
    onError: (error) => {
      console.error('Submission failed:', error.message);
    },
  });
};

// Corporation mutation
export const useCorporationMutation = () => {
  const queryClient = useQueryClient();
  const { data: employer } = useEmployerData();

  return useMutation({
    mutationFn: (data: CorporationDocumentData) => {
      if (!employer?.id) throw new Error('User not authenticated');
      return postCorporationData(employer.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CORPORATION_DATA_QUERY_KEY,
      });
    },
    onError: (error) => {
      console.error('Submission failed:', error.message);
    },
  });
};

export function usePostJobMutation() {
  const queryClient = useQueryClient();
  const { data: employer } = useEmployerData();
  const { data: userData } = useUserData();
  const userId = userData?.id;
  return useMutation({
    mutationFn: (job: JobPostingFormData) => {
      if (!employer?.id || !userId) throw new Error('Missing user references');
      return postJob(employer.id, userId, job);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [EMPLOYER_DATA_QUERY_KEY, employer?.id],
      });
    },
    onError: (error: Error) => {
      console.error('Job post error:', error.message);
      return;
    },
  });
}
