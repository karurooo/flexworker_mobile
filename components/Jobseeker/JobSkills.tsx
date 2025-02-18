import { zodResolver } from "@hookform/resolvers/zod";
import { FormProvider, useForm } from "react-hook-form";
import { useJobSeekerMutations } from "~/mutations/query/jobseeker/useJobseekerMutation";
import { JobSkillsFormData, JobSkillsSchema } from "~/schema/jobeekerSchema";
import { View, KeyboardAvoidingView, FlatList, Text, Platform } from "react-native";
import FormField from "~/components/Shared/Forms/FormFields";
import DropdownFormField from "~/components/Shared/Forms/DropdownForms";
import Button from "~/components/Shared/Buttons/Button";
import React, { useMemo, useCallback } from "react";
import { jobIndustrySpecializationMap } from "~/constants/jobSpecialization";
import { JobSeekerProps } from "~/types/jobseeker";
import { useUserData } from "~/hooks/query/useUserData";
import { useQueryClient } from "@tanstack/react-query";
import { JOB_SKILLS_QUERY_KEY } from "~/constants/auth/queryKeys";
import { useJobSeekerSkillsData } from "~/hooks/query/useJobSeekerData";

type FormFieldItem =
  | {
      type: "dropdown";
      name: keyof JobSkillsFormData;
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

const JobSkillsForm = React.memo(({ onCloseModal }: JobSeekerProps) => {
  const formMethods = useForm<JobSkillsFormData>({
    resolver: zodResolver(JobSkillsSchema),
    defaultValues: {
      jobIndustry: "",
      jobSpecialization: "",
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;
  const { jobSkillsMutation } = useJobSeekerMutations();
  const { mutate, isPending } = jobSkillsMutation;
  const queryClient = useQueryClient();
  const { data: users } = useUserData();
  const userId = users?.id;
  const { refetch: refetchJobSeekerSkills } = useJobSeekerSkillsData();

  const onSubmit = (data: JobSkillsFormData) => {
    mutate(data, {
      onSuccess: async () => {
        await queryClient.invalidateQueries({ queryKey: [JOB_SKILLS_QUERY_KEY] });
        await queryClient.invalidateQueries({ queryKey: ["matchedJobs", userId] });
        await refetchJobSeekerSkills();
        onCloseModal();
      },
      onError: (error) => {
        console.error("Job Skills Error:", error);
      },
    });
  };

  const formFields = useMemo<FormFieldItem[]>(
    () => [
      {
        type: "dropdown",
        name: "jobIndustry",
        label: "Job Industry",
        options: JOB_INDUSTRY_OPTIONS,
      },
      {
        type: "dropdown",
        name: "jobSpecialization",
        label: "Job Specialization",
        options: JOB_SPECIALIZATION_OPTIONS,
      },
    ],
    []
  );

  const keyExtractor = useCallback(
    (item: FormFieldItem, index: number) =>
      item.name ? `${item.type}-${index}` : `${item.name}-${index}`,
    []
  );

  const ListFooter = useMemo(
    () => (
      <Button
        title={isPending ? "Saving..." : "Add Job Skill"}
        onPress={handleSubmit(onSubmit)}
        disabled={isPending}
      />
    ),
    [isPending, handleSubmit, onSubmit]
  );

  const renderItem = useCallback(
    ({ item }: { item: FormFieldItem }) => (
      <DropdownFormField
        control={control}
        name={item.name}
        label={item.label}
        options={item.options}
        error={errors[item.name]?.message}
      />
    ),
    [control, errors]
  );

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Text className="text-bold text-2xl font-bold">Job Skills</Text>
        <Text className="text-md mb-4">Add your job skills</Text>

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

export default JobSkillsForm;