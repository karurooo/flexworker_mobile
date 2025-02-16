import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useJobSeekerMutations } from '~/mutations/query/jobseeker/useJobseekerMutation';
import { JobPreferenceFormData, JobPrefreferenceSchema } from '~/schema/jobeekerSchema';
import { View, KeyboardAvoidingView, FlatList, Text, Platform } from 'react-native';
import FormField from '~/components/Shared/Forms/FormFields';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import Button from '~/components/Shared/Buttons/Button';
import React, { useMemo, useCallback } from 'react';
import {
  WorkTypeCategory,
  SalaryTypeCategory,
  PlanToWorkCategory,
  LocationCategory,
} from '~/types/jobseeker';
import { jobIndustrySpecializationMap } from '~/constants/jobSpecialization';
import { JobSeekerProps } from '~/types/jobseeker';
import { useUserData } from '~/hooks/query/useUserData';
import { useQueryClient } from '@tanstack/react-query';
import { JOB_SEEKER_QUERY_KEY } from '~/constants/auth/queryKeys';

type FormFieldItem =
  | {
      type?: 'text';
      name: keyof JobPreferenceFormData;
      label: string;
      keyboardType?: 'numeric';
    }
  | {
      type: 'dropdown';
      name: keyof JobPreferenceFormData;
      label: string;
      options: Array<{ label: string; value: string }>;
    };

const JOB_INDUSTRY_OPTIONS = Object.keys(jobIndustrySpecializationMap).map((value) => ({
  label: value,
  value,
}));

const JOB_SPECIALIZATION_OPTIONS = Object.entries(jobIndustrySpecializationMap).flatMap(
  ([industry, specializations]) =>
    specializations.map((spec) => ({
      label: spec,
      value: `${industry}-${spec}`,
    }))
);

const WORK_TYPE_OPTIONS = Object.values(WorkTypeCategory)
  .filter((v) => v !== WorkTypeCategory.ALL)
  .map((value) => ({ label: value, value }));

const SALARY_TYPE_OPTIONS = Object.values(SalaryTypeCategory).map((value) => ({
  label: value,
  value,
}));

const LOCATION_OPTIONS = Object.values(LocationCategory).map((value) => ({ label: value, value }));

const PLAN_TO_WORK_OPTIONS = Object.values(PlanToWorkCategory).map((value) => ({
  label: value,
  value,
}));

const JobPreferenceForm = React.memo(({ onCloseModal }: JobSeekerProps) => {
  const formMethods = useForm<JobPreferenceFormData>({
    resolver: zodResolver(JobPrefreferenceSchema),
    defaultValues: {
      jobIndustry: '',
      jobSpecialization: '',
      workType: '',
      salaryType: '',
      minSalary: '',
      maxSalary: '',
      planToWork: '',
      location: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;
  const { jobPreferenceMutation } = useJobSeekerMutations();
  const { mutate, isPending } = jobPreferenceMutation;
  const queryClient = useQueryClient();
  const { data: users } = useUserData();
  const userId = users?.id;

  const onSubmit = (data: JobPreferenceFormData) => {
    mutate(data, {
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ['matchedJobs'],
          exact: false,
        });
        onCloseModal?.();
      },
    });
  };

  const formFields = useMemo<FormFieldItem[]>(
    () => [
      {
        type: 'dropdown',
        name: 'jobIndustry',
        label: 'Job Industry',
        options: JOB_INDUSTRY_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'jobSpecialization',
        label: 'Job Specialization',
        options: JOB_SPECIALIZATION_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'workType',
        label: 'Work Type',
        options: WORK_TYPE_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'salaryType',
        label: 'Salary Type',
        options: SALARY_TYPE_OPTIONS,
      },

      {
        type: 'dropdown',
        name: 'planToWork',
        label: 'Plan to Work',
        options: PLAN_TO_WORK_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'location',
        label: 'Preferred Location',
        options: LOCATION_OPTIONS,
      },
      {
        type: 'text',
        name: 'minSalary',
        label: 'Minimum Salary',
        keyboardType: 'numeric',
      },
      {
        type: 'text',
        name: 'maxSalary',
        label: 'Maximum Salary',
        keyboardType: 'numeric',
      },
    ],
    []
  );

  const keyExtractor = useCallback(
    (item: FormFieldItem, index: number) =>
      item.type ? `${item.type}-${index}` : `${item.name}-${index}`,
    []
  );

  const ListFooter = useMemo(
    () => (
      <Button
        title={isPending ? 'Saving...' : 'Save Preferences'}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />
    ),
    [isPending, handleSubmit, onSubmit]
  );

  const renderItem = useCallback(
    ({ item }: { item: FormFieldItem }) => {
      if (item.type === 'dropdown') {
        return (
          <DropdownFormField
            control={control}
            name={item.name}
            label={item.label}
            options={item.options}
            error={errors[item.name]?.message}
          />
        );
      }

      return (
        <FormField
          control={control}
          name={item.name}
          label={item.label}
          keyboardType={item.keyboardType}
          error={errors[item.name]?.message}
        />
      );
    },
    [control, errors]
  );

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Text className="text-bold text-2xl font-bold">Job Preferences</Text>
        <Text className="text-md mb-4">Set your career preferences</Text>

        <FlatList
          data={formFields}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          ListFooterComponent={ListFooter}
          initialNumToRender={10}
          maxToRenderPerBatch={15}
          windowSize={21}
          removeClippedSubviews={false}
          getItemLayout={(data, index) => ({
            length: 100,
            offset: 100 * index,
            index,
          })}
          contentContainerStyle={{
            paddingBottom: Platform.select({
              ios: 350,
              android: 300,
            }),
          }}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />
      </KeyboardAvoidingView>
    </FormProvider>
  );
});

export default JobPreferenceForm;
