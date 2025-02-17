import React, { memo, useCallback, useMemo, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useForm, FormProvider, FieldValues } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { JobPostingFormData, JobPostingSchema } from '~/schema/employerSchema';
import { usePostJobMutation } from '~/mutations/query/employers/useEmployerMutation';
import Button from '~/components/Shared/Buttons/Button';
import InputField from '~/components/Shared/Forms/FormFields';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import Address from '../Shared/Address';
import ReusableModal from '~/components/Shared/Modal/PrimaryModal';
import { jobIndustrySpecializationMap } from '~/constants/jobSpecialization';
import { JobType, ContractDuration, JobExperience, SalaryType } from '~/types/employers';
import { AddressFormData } from '~/types/address';
import Alert from '~/components/Shared/Alerts';
import { useQueryClient } from '@tanstack/react-query';
import { useUserData } from '~/hooks/query/useUserData';
import { useEmployerData } from '~/hooks/query/useEmployerData';

// Optimized components
const MemoInput = memo(InputField);
const MemoDropdown = memo(DropdownFormField<JobPostingFormData>);
const MemoAddressPicker = memo(Address);

// Add lazy loading for heavy components

type FormSection = {
  type: 'text' | 'number' | 'dropdown' | 'address';
  name: keyof JobPostingFormData;
  label: string;
  options: (string | { label: string; value: string })[];
  inputType?: 'numeric' | 'default';
  multiline?: boolean;
  fields?: ('minSalary' | 'maxSalary')[];
  onSelect?: (value: string) => void;
  error?: string;
};

const JobPost = memo(({ onCloseModal }: { onCloseModal: () => void }) => {
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [address, setAddress] = useState<AddressFormData | null>(null);
  const [jobSpecializationOptions, setJobSpecializationOptions] = useState<string[]>([]);
  const { mutate: postJob, isPending } = usePostJobMutation();
  const queryClient = useQueryClient();
  const formMethods = useForm<JobPostingFormData>({
    resolver: zodResolver(JobPostingSchema),
    defaultValues: {
      title: '',
      jobIndustry: '',
      jobSpecialization: '',
      jobType: '',
      description: '',
      location: {
        region: '',
        province: '',
        city: '',
        street: '',
        barangay: '',
        zipCode: '',
      },
      experience: '',
      contractDuration: '',
      salaryType: '',
      minSalary: 0,
      maxSalary: 0,
    },
    mode: 'onChange',
  });
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [isSuccess, setIsSuccess] = useState(false);
  const { data: userData } = useUserData();
  const { data: employer } = useEmployerData();

  const employerId = userData?.id ?? '';

  const handleJobIndustrySelect = useCallback(
    (industry: string) => {
      formMethods.setValue('jobIndustry', industry);
      formMethods.setValue('jobSpecialization', '');
      setJobSpecializationOptions(jobIndustrySpecializationMap[industry] || []);
    },
    [formMethods]
  );

  const formFields = useMemo<FormSection[]>(
    () => [
      {
        type: 'text',
        name: 'title',
        label: 'Job Title',
        inputType: 'default',
        placeholder: 'Job Title',
        multiline: false,
        options: [],
        error: formMethods.formState.errors.title?.message,
      },
      {
        type: 'dropdown',
        name: 'jobIndustry',
        label: 'Job Industry',
        options: Object.keys(jobIndustrySpecializationMap).map((opt) => ({
          label: opt,
          value: opt,
        })),
        onSelect: handleJobIndustrySelect,
        error: formMethods.formState.errors.jobIndustry?.message,
      },
      {
        type: 'dropdown',
        name: 'jobSpecialization',
        label: 'Job Specialization',
        options: jobSpecializationOptions.map((opt) => ({ label: opt, value: opt })),
        error: formMethods.formState.errors.jobSpecialization?.message,
      },
      {
        type: 'dropdown',
        name: 'jobType',
        label: 'Job Type',
        options: Object.values(JobType),
        error: formMethods.formState.errors.jobType?.message,
      },
      {
        type: 'text',
        name: 'description',
        label: 'Job Description',
        placeholder: 'Job Description',
        multiline: true,
        options: [],
      },
      {
        type: 'address',
        name: 'location',
        label: 'Job Location',
        options: [],
        error: formMethods.formState.errors.location?.message,
      },

      {
        type: 'dropdown',
        name: 'experience',
        label: 'Experience',
        options: Object.values(JobExperience),
        error: formMethods.formState.errors.experience?.message,
      },
      {
        type: 'dropdown',
        name: 'contractDuration',
        label: 'Contract Duration',
        options: Object.values(ContractDuration),
        error: formMethods.formState.errors.contractDuration?.message,
      },
      {
        type: 'dropdown',
        name: 'salaryType',
        label: 'Salary Type',
        options: Object.values(SalaryType),
        error: formMethods.formState.errors.salaryType?.message,
      },
      {
        type: 'text',
        label: 'Minimum Salary',
        name: 'minSalary',
        placeholder: 'Min Salary',
        multiline: false,
        keyboardType: 'numeric',
        options: [],
        error: formMethods.formState.errors.minSalary?.message,
      },
      {
        type: 'text',
        label: 'Maximum Salary',
        name: 'maxSalary',
        placeholder: 'Max Salary',
        multiline: false,
        keyboardType: 'numeric',
        options: [],
        error: formMethods.formState.errors.maxSalary?.message,
      },
    ],
    [jobSpecializationOptions, handleJobIndustrySelect, formMethods.formState.errors]
  );

  const handleAddressSubmit = (data: AddressFormData) => {
    setAddress(data);
    formMethods.setValue('location', data.address);
    setAddressModalVisible(false);
  };

  const onSubmit = useCallback(
    (data: JobPostingFormData) => {
      console.log('Submitting form data:', data);
      console.log('Form errors:', formMethods.formState.errors);
      console.log('Form values:', formMethods.getValues());
      postJob(
        {
          ...data,
          employer_user_id: userData?.id,
        } as JobPostingFormData & { employer_user_id: string },
        {
          onSuccess: () => {
            console.log('Post job success');
            queryClient.invalidateQueries({
              queryKey: ['employerJobs', employerId],
            });
            setSuccessMessage('Job posted successfully!');
            setTimeout(() => setSuccessMessage(null), 3000);
            onCloseModal();
            formMethods.reset();
          },
          onError: (error) => {
            console.error('Job post error:', error);
            setErrorMessage(error.message || 'Failed to post job - check form validation');
            flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
          },
        }
      );
    },
    [postJob, onCloseModal, formMethods, queryClient, employerId, userData?.id]
  );

  const renderItem = useCallback(
    ({ item }: { item: FormSection }) => {
      switch (item.type) {
        case 'text':
          return <MemoInput {...item} control={formMethods.control} />;
        case 'dropdown':
          return <MemoDropdown {...item} control={formMethods.control} error={item.error} />;
        case 'address':
          const location = formMethods.watch('location');
          const addressText = location.street
            ? `${location.street}, ${location.barangay}, ${location.city}`
            : 'Select Location';
          return (
            <View className="my-2">
              <Text>Job Location</Text>
              <TouchableOpacity
                onPress={() => setAddressModalVisible(true)}
                className="my-2 rounded-lg border border-gray-400 px-4 py-3">
                <Text className="text-gray-700">{addressText}</Text>
              </TouchableOpacity>
              {formMethods.formState.errors.location && (
                <Text className="mt-1 text-sm text-red-500">
                  {formMethods.formState.errors.location.message}
                </Text>
              )}
            </View>
          );
        default:
          return null;
      }
    },
    [formMethods]
  );

  const flatListRef = useRef<FlatList>(null);

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.select({
          ios: 90,
          android: 60,
        })}
        style={{ flex: 1 }}>
        <FlatList
          ref={flatListRef}
          data={formFields}
          renderItem={renderItem}
          keyExtractor={(item) => item.name}
          initialNumToRender={8}
          maxToRenderPerBatch={5}
          windowSize={11}
          removeClippedSubviews={true}
          getItemLayout={(data, index) => ({
            length: 90,
            offset: 90 * index,
            index,
          })}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <View className="my-2">
              <Text className="text-2xl font-bold">Create Job Post</Text>
              <Text className="text-gray-600">Fill in the job details</Text>
              {errorMessage && (
                <Alert
                  isVisible={!!errorMessage}
                  variant="error"
                  title="Posting Error"
                  message={errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              )}
              {isSuccess && (
                <Alert
                  isVisible={isSuccess}
                  variant="success"
                  title="Success"
                  message={'Job posted successfully!'}
                  onClose={() => setIsSuccess(false)}
                />
              )}
            </View>
          }
          ListFooterComponent={
            <Button
              title={isPending ? 'Posting...' : 'Post Job'}
              onPress={formMethods.handleSubmit(onSubmit)}
              disabled={isPending}
            />
          }
          contentContainerStyle={{
            paddingBottom: Platform.select({
              ios: 300,
              android: 250,
            }),
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />

        <React.Suspense fallback={null}>
          <ReusableModal
            visible={isAddressModalVisible}
            onClose={() => setAddressModalVisible(false)}
            avoidKeyboard={true}>
            <MemoAddressPicker onSubmit={handleAddressSubmit} />
          </ReusableModal>
        </React.Suspense>
      </KeyboardAvoidingView>
    </FormProvider>
  );
});

export default JobPost;
