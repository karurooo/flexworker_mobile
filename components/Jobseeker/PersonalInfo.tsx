import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useJobSeekerMutations } from '~/mutations/query/jobseeker/useJobseekerMutation';
import { PersonalInformationFormData, PersonalInformationSchema } from '~/schema/jobeekerSchema';
import { View, ScrollView, KeyboardAvoidingView, FlatList, Text } from 'react-native';
import FormField from '~/components/Shared/Forms/FormFields';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import Button from '~/components/Shared/Buttons/Button';
import React, { useMemo, useState } from 'react';
import PickImage from '~/components/Shared/PickImage';
import CameraCapture from '~/components/Shared/CameraCapture';
import {
  GENDER_OPTIONS,
  RELIGION_OPTIONS,
  CIVIL_STATUS_OPTIONS,
  YesNoOptions,
} from '~/constants/employers/options';
import { JobSeekerProps } from '~/types/jobseeker';
import { JOB_SEEKER_QUERY_KEY } from '~/constants/auth/queryKeys';
import { useUserData } from '~/hooks/query/useUserData';
import { useQueryClient } from '@tanstack/react-query';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import Address from '~/components/Shared/Address';
import { postPresentAddress } from '~/services/api/jobseekers/jobseekerDataApi';
import { AddressFormData } from '~/types/address';

// Add type definitions at the top
type FormFieldItem =
  | {
      type?: undefined;
      name: keyof PersonalInformationFormData;
      label: string;
      keyboardType?: 'phone-pad' | 'numeric';
      maxLength?: number;
    }
  | {
      type: 'dropdown';
      name: keyof PersonalInformationFormData;
      label: string;
      options: Array<{ label: string; value: string }>;
    };

const PersonalInformationForm = React.memo(({ onCloseModal }: JobSeekerProps) => {
  const formMethods = useForm<PersonalInformationFormData>({
    resolver: zodResolver(PersonalInformationSchema),
    defaultValues: {
      firstName: '',
      middleName: '',
      lastName: '',
      sex: '',
      religion: '',
      contactNumber: '',
      civilStatus: '',
      civilService: '',
      tin: '',
    },
  });

  const {
    handleSubmit,
    control,
    formState: { errors },
  } = formMethods;
  const { personalInfoMutation } = useJobSeekerMutations();
  const { mutate, isPending } = personalInfoMutation;
  const queryClient = useQueryClient();
  const { data: users } = useUserData();
  const userId = users?.id;

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [addressSubmitted, setAddressSubmitted] = useState(false);

  const handleAddressSubmit = async (data: AddressFormData) => {
    try {
      if (!userId) throw new Error('User not authenticated');

      await postPresentAddress(
        {
          ...data.address,
          region: data.address.region,
          province: data.address.province,
          city: data.address.city,
          barangay: data.address.barangay,
          street: data.address.street,
          zipCode: data.address.zipCode,
        },
        userId
      );
      setAddressSubmitted(true);
      setShowAddressModal(false);
    } catch (error) {
      console.error('Address submission failed:', error);
      // Add error handling as needed
    }
  };

  const onSubmit = (data: PersonalInformationFormData) => {
    mutate(data, {
      onSuccess: () => {
        onCloseModal?.();
        queryClient.invalidateQueries({ queryKey: [JOB_SEEKER_QUERY_KEY, userId] });
      },
    });
  };

  // Update formFields declaration
  const formFields = useMemo<FormFieldItem[]>(
    () => [
      { name: 'firstName', label: 'First Name' },
      { name: 'middleName', label: 'Middle Name' },
      { name: 'lastName', label: 'Last Name' },
      {
        name: 'contactNumber',
        label: 'Contact Number',
        keyboardType: 'phone-pad',
      },
      {
        type: 'dropdown',
        name: 'sex',
        label: 'Gender',
        options: GENDER_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'religion',
        label: 'Religion',
        options: RELIGION_OPTIONS,
      },

      {
        type: 'dropdown',
        name: 'civilStatus',
        label: 'Civil Status',
        options: CIVIL_STATUS_OPTIONS,
      },
      {
        type: 'dropdown',
        name: 'civilService',
        label: 'Civil Service Eligibility',
        options: YesNoOptions,
      },
    ],
    []
  );

  // Update renderItem function
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
          maxLength={item.maxLength}
          error={errors[item.name]?.message}
        />
      );
    },
    [control, errors]
  );

  return (
    <FormProvider {...formMethods}>
      <KeyboardAvoidingView behavior="padding" style={{ flex: 1 }}>
        <Text className="text-bold  text-2xl font-bold">Personal Information</Text>
        <Text className=" text-md  mb-4">Please fill out the following information</Text>
        <FlatList
          data={formFields}
          renderItem={renderItem}
          keyExtractor={(item, index) => `${item.name}-${index}`}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          initialNumToRender={formFields.length}
          getItemLayout={(data, index) => ({ length: 80, offset: 80 * index, index })}
          ListFooterComponent={
            <>
              <View className="mt-4">
                <Text className="text-bold text-md">Present Address</Text>
                <Button
                  title={addressSubmitted ? 'Address Submitted ✓' : 'Add Present Address'}
                  onPress={() => setShowAddressModal(true)}
                  variant={addressSubmitted ? 'disabled' : 'secondary'}
                />
              </View>

              <View className="mb-4 w-full flex-row items-center justify-center gap-2">
                {/* TIN Image Section */}
                <View className="flex-1">
                  <Text className="my-1 text-sm">TIN Image Upload</Text>
                  <PickImage onImageSelected={(url) => formMethods.setValue('tin', url)} />
                </View>

                {/* Selfie with TIN Section */}
                <View className="flex-1">
                  <Text className="my-1 text-sm">Selfie with TIN ID</Text>
                  <CameraCapture
                    onImageCaptured={(url) => formMethods.setValue('selfieTin', url)}
                    title="Take Selfie with TIN"
                  />
                </View>
              </View>

              <Text className="mb-4 text-sm text-gray-600">
                Note: Upload TIN document and take a selfie holding your TIN ID
              </Text>

              <Button
                title={isPending ? 'Submitting...' : 'Submit'}
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
              />
            </>
          }
        />
      </KeyboardAvoidingView>

      {showAddressModal && (
        <PrimaryModal visible={showAddressModal} onClose={() => setShowAddressModal(false)}>
          <Address onSubmit={handleAddressSubmit} />
        </PrimaryModal>
      )}
    </FormProvider>
  );
});

export default PersonalInformationForm;
