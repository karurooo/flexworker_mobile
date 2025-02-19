import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { governmentEmployerSchema } from '~/schema/employerSchema';
import { useGovernmentMutation } from '~/mutations/query/employers/useEmployerMutation';
import Button from '~/components/Shared/Buttons/Button';
import Alert from '~/components/Shared/Alerts';
import PickImage from '~/components/Shared/PickImage';
import CameraCapture from '~/components/Shared/CameraCapture';
import DocumentPicker from '~/components/Shared/DocumentPicker';
import TextInputField from '~/components/Shared/Forms/DropdownForms';
import FormField from '~/components/Shared/Forms/FormFields';

const Government = memo(({ onCloseModal }: { onCloseModal: () => void }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(governmentEmployerSchema),
  });

  const { mutate, isPending, isError, isSuccess } = useGovernmentMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formFields = useMemo(
    () => [
      {
        type: 'text',
        name: 'agencyName',
        label: 'Agency Name',
        required: true,
        placeholder: 'Enter your agency name',
      },
      {
        type: 'text',
        name: 'department',
        label: 'Department Name',
        required: true,
        placeholder: 'Enter your agency name',
      },
      {
        document: { type: 'image', name: 'philGeps', label: 'PhilGEPS Registration' },
        selfie: { type: 'selfie', name: 'philGepsSelfie', label: 'PhilGEPS Selfie' },
      },
      {
        type: 'document',
        name: 'accreditation',
        label: 'Government Accreditation',
      },
    ],
    []
  );

  const handleDocumentSelect = useCallback(
    (fieldName: string) => (url: string) => setValue(fieldName, url),
    [setValue]
  );

  const onSubmit = useCallback(
    (data: any) => {
      mutate(data, {
        onSuccess: () => {
          setSuccessMessage('Documents submitted successfully!');
          setTimeout(onCloseModal, 2000);
        },
        onError: (error) => setErrorMessage(error.message),
      });
    },
    [mutate, onCloseModal]
  );

  const renderItem = useCallback(
    ({ item }: { item: any }) => {
      if (item.type === 'text') {
        return (
          <FormField
            control={control}
            name={item.name}
            label={item.label}
            placeholder={item.placeholder}
            keyboardType={item.keyboardType}
            error={errors[item.name]?.message as string}
          />
        );
      }

      if (item.type === 'document') {
        return (
          <View className="mb-4">
            <Text className="mb-2 text-sm  ">{item.label}</Text>
            <DocumentPicker
              onDocumentSelected={handleDocumentSelect(item.name)}
              title={`Upload ${item.label}`}
            />
            {errors[item.name] && (
              <Text className="mt-1 text-xs text-red-500">
                {errors[item.name]?.message as string}
              </Text>
            )}
          </View>
        );
      }

      return (
        <View className="mb-2 w-full flex-row items-center justify-center gap-2">
          <View className="flex-1">
            <Text className="my-1 text-sm  ">{item.document.label}</Text>
            <PickImage
              onImageSelected={handleDocumentSelect(item.document.name)}
              title={`Upload ${item.document.label}`}
            />
            {errors[item.document.name] && (
              <Text className="mt-1 text-xs text-red-500">
                {errors[item.document.name]?.message as string}
              </Text>
            )}
          </View>
        </View>
      );
    },
    [control, errors, handleDocumentSelect]
  );

  return (
    <View className="flex-1 p-4">
      <Text className=" text-2xl font-bold">Government Requirements</Text>
      <Text className=" text-md  mb-4">Please fill out the following information</Text>
      <FlatList
        data={formFields}
        renderItem={renderItem}
        keyExtractor={(item) => item.name || `${item.document?.name}-${item.selfie?.name}`}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <View className="py-1">
            {isError && (
              <Alert
                variant="error"
                title="Error!"
                message={errorMessage || ''}
                isVisible={!!errorMessage}
                onClose={onCloseModal}
              />
            )}
            {isSuccess && (
              <Alert
                variant="success"
                title="Success!"
                message={successMessage || ''}
                isVisible={!!successMessage}
                onClose={onCloseModal}
              />
            )}
            <Text className="mb-2  text-sm text-gray-600">
              Note: Use the Image button to upload a file and the Camera button to take a selfie
              with the certificate.
            </Text>
            <Button
              title="Submit Documents"
              onPress={handleSubmit(onSubmit)}
              disabled={isPending}
            />
          </View>
        }
      />
    </View>
  );
});

export default Government;
