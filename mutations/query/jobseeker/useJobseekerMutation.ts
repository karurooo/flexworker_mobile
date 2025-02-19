import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postJobseekerPersonalInfo,
  postEducationalBackground,
  postCoverLetter,
  postJobPreference,
  postPresentAddress,
  postJobSkills,
} from '~/services/api/jobseekers/jobseekerDataApi';
import { JOB_SEEKER_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserData } from '~/hooks/query/useUserData';
import {
  EducationalBackgroundFormData,
  CoverLetterFormData,
  JobPreferenceFormData,
  PresentAddressFormData,
  JobSkillsFormData,
} from '~/schema/jobeekerSchema';

export const useJobSeekerMutations = () => {
  const queryClient = useQueryClient();
  const { data: userData } = useUserData();
  const userId = userData?.id;

  // Personal Info Mutation
  const personalInfoMutation = useMutation({
    mutationFn: (data: Parameters<typeof postJobseekerPersonalInfo>[0]) => {
      if (!userId) throw new Error('User not authenticated');
      return postJobseekerPersonalInfo(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  // Educational Background Mutation
  const educationalBackgroundMutation = useMutation({
    mutationFn: (data: EducationalBackgroundFormData) => {
      if (!userId) throw new Error('User not authenticated');
      return postEducationalBackground(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  // Cover Letter Mutation
  const coverLetterMutation = useMutation({
    mutationFn: (data: CoverLetterFormData) => {
      if (!userId) throw new Error('User not authenticated');
      return postCoverLetter(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  // Job Preference Mutation
  const jobPreferenceMutation = useMutation({
    mutationFn: (data: JobPreferenceFormData) => {
      if (!userId) throw new Error('User not authenticated');
      return postJobPreference(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  // Present Address Mutation
  const presentAddressMutation = useMutation({
    mutationFn: (data: PresentAddressFormData) => {
      if (!userId) throw new Error('User not authenticated');
      return postPresentAddress(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  const jobSkillsMutation = useMutation({
    mutationFn: (data: JobSkillsFormData) => {
      if (!userId) throw new Error('User not authenticated');
      return postJobSkills(data, userId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] }),
  });

  return {
    personalInfoMutation,
    educationalBackgroundMutation,
    coverLetterMutation,
    jobPreferenceMutation,
    presentAddressMutation,
    jobSkillsMutation,
  };
};
