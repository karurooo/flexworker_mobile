import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { soleProprietorshipSchema } from '~/schema/employerSchema';
import DocumentPicker from '~/components/Shared/DocumentPicker';
import { useSoleProprietorshipMutation } from '~/mutations/query/employers/useEmployerMutation';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import Button from '~/components/Shared/Buttons/Button';
import Alert from '~/components/Shared/Alerts';
import { Type } from '~/types/employers';
import PickImage from '~/components/Shared/PickImage';
import CameraCapture from '~/components/Shared/CameraCapture';

const SoleProprietorship = memo(({ onCloseModal }: { onCloseModal: () => void }) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(soleProprietorshipSchema),
  });

  const { mutate, isPending } = useSoleProprietorshipMutation();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formFields = useMemo(
    () => [
      {
        type: 'dropdown',
        name: 'type',
        label: 'Business Type',
        options: Object.values(Type).map((value) => ({ label: value, value })),
      },
      {
        document: { type: 'document', name: 'dtiCert', label: 'DTI Certificate' },
        selfie: { type: 'selfie', name: 'dtiCertSelfie', label: 'Selfie with DTI' },
      },
      {
        document: { type: 'document', name: 'businessPermit', label: 'Business Permit' },
        selfie: { type: 'selfie', name: 'businessPermitSelfie', label: 'Permit Selfie' },
      },
      {
        document: { type: 'document', name: 'birCert', label: 'BIR Certificate' },
        selfie: { type: 'selfie', name: 'birCertSelfie', label: 'BIR Selfie' },
      },
    ],
    []
  );

  const handleDocumentSelect = useCallback(
    (fieldName: string) => (url: string) => {
      setValue(fieldName, url);
    },
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
      if (item.type === 'dropdown') {
        return (
          <DropdownFormField
            control={control}
            name={item.name}
            label={item.label}
            options={item.options}
            error={errors[item.name]?.message as string | undefined}
          />
        );
      }

      return (
        <View className="mb-2 w-full flex-row items-center justify-center gap-2">
          {Object.entries(item).map(([key, field]) => (
            <View key={(field as any).name} className="flex-1">
              <Text className="my-1 text-sm text-gray-700">{(field as any).label}</Text>
              {(field as any).type === 'document' ? (
                <PickImage
                  onImageSelected={handleDocumentSelect((field as any).name)}
                  title={`Upload ${(field as any).label}`}
                />
              ) : (
                <CameraCapture
                  onImageCaptured={handleDocumentSelect((field as any).name)}
                  title={`Take ${(field as any).label}`}
                />
              )}
              {errors[(field as any).name] && (
                <Text className="mt-1 text-xs text-red-500">
                  {errors[(field as any).name]?.message as string}
                </Text>
              )}
            </View>
          ))}
        </View>
      );
    },
    [control, errors, handleDocumentSelect]
  );

  return (
    <View className="p-4">
      <Text className="text-bold  text-2xl font-bold">Sole Proprietorship </Text>
      <Text className=" text-md  mb-4">Please fill out the following information</Text>

      <FlatList
        data={formFields}
        renderItem={renderItem}
        keyExtractor={(item) =>
          Object.values(item)
            .map((f) => (f as any).name)
            .join('-')
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={
          <>
            <View className="pt-4">
              {' '}
              {/* Add top padding */}
              {errorMessage && (
                <Alert
                  variant="error"
                  title="Submission Error"
                  message={errorMessage || ''}
                  isVisible={!!errorMessage}
                  onClose={() => setErrorMessage(null)}
                />
              )}
              {successMessage && (
                <Alert
                  variant="success"
                  title="Success"
                  message={successMessage}
                  isVisible={!!successMessage}
                  onClose={() => setSuccessMessage(null)}
                />
              )}
              <Text className="mb-4  text-sm text-gray-600">
                Note: Use the Image button to upload a file and the Camera button to take a selfie
                with the certificate.
              </Text>
              <Button
                title="Submit Documents"
                onPress={handleSubmit(onSubmit)}
                disabled={isPending}
              />
            </View>
          </>
        }
      />
    </View>
  );
});

export default SoleProprietorship;
