import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useJobSeekerMutations } from '~/mutations/query/jobseeker/useJobseekerMutation';
import { CoverLetterFormData, CoverLetterSchema } from '~/schema/jobeekerSchema';
import { View, KeyboardAvoidingView, FlatList, Text } from 'react-native';
import FormField from '~/components/Shared/Forms/FormFields';
import Button from '~/components/Shared/Buttons/Button';
import React, { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { JOB_SEEKER_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserData } from '~/hooks/query/useUserData';

type FormFieldItem = {
  name: keyof CoverLetterFormData;
  label: string;
  multiline?: boolean;
  numberOfLines?: number;
};

interface JobSeekerProps {
  onCloseModal?: () => void;
}

const CoverLetterForm = React.memo(({ onCloseModal }: JobSeekerProps) => {
  const formMethods = useForm<CoverLetterFormData>({
    resolver: zodResolver(CoverLetterSchema),
    defaultValues: {
      coverLetter: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;
  const { coverLetterMutation } = useJobSeekerMutations();
  const { mutate, isPending } = coverLetterMutation;
  const { data: users } = useUserData();
  const userId = users?.id;

  const queryClient = useQueryClient();
  const onSubmit = (data: CoverLetterFormData) => {
    mutate(data, {
      onSuccess: () => {
        onCloseModal?.();
        queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] });
      },
    });
  };

  const formFields = useMemo<FormFieldItem[]>(
    () => [
      {
        name: 'coverLetter',
        label: 'Cover Letter',
        multiline: true,
        numberOfLines: 8,
      },
    ],
    []
  );

  const renderItem = React.useCallback(
    ({ item }: { item: FormFieldItem }) => (
      <FormField
        control={control}
        name={item.name}
        label={item.label}
        multiline={item.multiline}
        numberOfLines={item.numberOfLines}
        error={errors[item.name]?.message}
      />
    ),
    [control, errors]
  );

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Text className="text-bold text-2xl font-bold">Cover Letter</Text>
        <Text className="text-md mb-4">Write your professional cover letter</Text>

        <FlatList
          data={formFields}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ListFooterComponent={
            <Button
              title={isPending ? 'Saving...' : 'Save Cover Letter'}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          }
        />
      </KeyboardAvoidingView>
    </FormProvider>
  );
});

export default CoverLetterForm;
