import { useMutation, useQueryClient } from '@tanstack/react-query';
import { EMPLOYER_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';
import { submitEmployerData, submitGovernmentData } from '~/services/api/employers/employerDataApi';
import { Employer, GovernmentEmployer } from '~/types/employers';

interface EmployerMutationData {
  user_id: string;
  category: string;
  address: any; // Replace with proper address type
  status: string;
  [key: string]: any;
}

export const useEmployerMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EmployerMutationData) => submitEmployerData(data),
    onSuccess: (newData: Employer) => {
      queryClient.setQueryData([EMPLOYER_DATA_QUERY_KEY], newData);
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_DATA_QUERY_KEY] });
    },
  });
};

interface GovernmentMutationData {
  agencyName: string;
  department: string;
  philGeps: string;
  philGepsSelfie: string;
  accreditation: string;
  status?: string;
}

export const useGovernmentMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: GovernmentMutationData) => submitGovernmentData(data),
    onSuccess: (newData: GovernmentEmployer) => {
      queryClient.setQueryData<Employer | undefined>([EMPLOYER_DATA_QUERY_KEY], (oldData) =>
        oldData
          ? {
              ...oldData,
              governmentDocs: newData,
            }
          : undefined
      );
      queryClient.invalidateQueries({ queryKey: [EMPLOYER_DATA_QUERY_KEY] });
    },
  });
};

// Similar updates for Corporation and SoleProprietorship mutations
