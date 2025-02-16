import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useJobSeekerMutations } from '~/mutations/query/jobseeker/useJobseekerMutation';
import {
  EducationalBackgroundFormData,
  EducationalBackgroundSchema,
} from '~/schema/jobeekerSchema';
import { View, ScrollView, KeyboardAvoidingView, FlatList, Text } from 'react-native';
import FormField from '~/components/Shared/Forms/FormFields';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import Button from '~/components/Shared/Buttons/Button';
import React, { useMemo } from 'react';

type FormFieldItem =
  | {
      type?: 'text';
      name: keyof EducationalBackgroundFormData;
      label: string;
      keyboardType?: 'default' | 'numeric';
      multiline?: boolean;
    }
  | {
      type: 'dropdown';
      name: keyof EducationalBackgroundFormData;
      label: string;
      options: Array<{ label: string; value: string }>;
    };

const EducationalBackgroundForm = React.memo(() => {
  const formMethods = useForm<EducationalBackgroundFormData>({
    resolver: zodResolver(EducationalBackgroundSchema),
    defaultValues: {
      elementary: '',
      highschool: '',
      bachelor: '',
      techvoc: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;
  const { educationalBackgroundMutation } = useJobSeekerMutations();
  const { mutate, isPending } = educationalBackgroundMutation;

  const onSubmit = (data: EducationalBackgroundFormData) => {
    mutate(data);
  };

  const formFields = useMemo<FormFieldItem[]>(
    () => [
      { type: 'text', name: 'elementary', label: 'Elementary School', multiline: true },
      { type: 'text', name: 'highschool', label: 'High School', multiline: true },
      { type: 'text', name: 'bachelor', label: 'Bachelor Degree', multiline: true },
      { type: 'text', name: 'techvoc', label: 'Technical/Vocational', multiline: true },
    ],
    []
  );

  const renderItem = React.useCallback(
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
          multiline={item.multiline}
          error={errors[item.name]?.message}
        />
      );
    },
    [control, errors]
  );

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Text className="text-bold text-2xl font-bold">Educational Background</Text>
        <Text className="text-md mb-4">Please provide your educational history</Text>

        <FlatList
          data={formFields}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={formFields.length}
          getItemLayout={(data, index) => ({ length: 100, offset: 100 * index, index })}
          ListFooterComponent={
            <Button
              title={isPending ? 'Saving...' : 'Save Education'}
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          }
        />
      </KeyboardAvoidingView>
    </FormProvider>
  );
});

export default EducationalBackgroundForm;
