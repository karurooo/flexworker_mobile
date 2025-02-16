import React, { memo, useCallback, useMemo, useState } from 'react';
import { View, Text, TouchableOpacity, Image, FlatList } from 'react-native';
import { EmployerProps } from '~/types/employers';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { corporationSchema, CorporationDocumentData } from '~/schema/employerSchema';
import { useCorporationMutation } from '~/mutations/query/employers/useEmployerMutation';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import Address from '~/components/Shared/Address';
import CameraCapture from '~/components/Shared/CameraCapture';
import PickImage from '~/components/Shared/PickImage';
import { useFileStore } from '~/store/files';
import { AddressFormData } from '~/schema/addressSchema';
import { QueryClient } from '@tanstack/react-query';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import Buttons from '~/components/Shared/Buttons/Button';
import { useUserData } from '~/hooks/query/useUserData';
import { CORPORATION_DATA_QUERY_KEY } from '~/constants/auth/queryKeys';
import DocumentPicker from '~/components/Shared/DocumentPicker';
import Alert from '~/components/Shared/Alerts';

const Corporation = memo(({ onCloseModal }: EmployerProps) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
    watch,
  } = useForm<CorporationDocumentData>({
    resolver: zodResolver(corporationSchema),
    defaultValues: {
      birCert: '',
      businessPermit: '',
      secCert: '',
      artInc: '',
      corporateLocation: {
        region: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
        zipCode: '',
      },
      birCertSelfie: '',
      businessPermitSelfie: '',
      secCertSelfie: '',
    },
  });

  const { mutate: submitCorporation, isPending } = useCorporationMutation();
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const AddressField = memo(() => (
    <View className="mt-1">
      <Text className="text-bold  text-md">Corporate Address</Text>
      <TouchableOpacity
        className=" rounded-lg border p-2"
        onPress={() => setShowAddressModal(true)}>
        <Text className="text-black">
          {watch('corporateLocation.street') ? (
            `${watch('corporateLocation.street')}, ${watch('corporateLocation.barangay')}, ${(watch('corporateLocation.city'), `${watch('corporateLocation.province')}`)},  ${watch('corporateLocation.region')}, ${watch('corporateLocation.zipCode')} Philippines `
          ) : (
            <Text className="text-center"> Add Address</Text>
          )}
        </Text>
      </TouchableOpacity>
    </View>
  ));

  const onSubmit = useCallback(
    (data: CorporationDocumentData) => {
      const validation = corporationSchema.safeParse(data);

      if (!validation.success) {
        setErrorMessage('Please fix all form errors before submitting');
        return;
      }

      submitCorporation(validation.data, {
        onSuccess: () => {
          setSuccessMessage('Corporation documents submitted successfully!');
          setTimeout(onCloseModal, 2000); // Auto-close after 2 seconds
        },
        onError: (error) => setErrorMessage(error.message),
      });
    },
    [submitCorporation, onCloseModal]
  );

  return (
    <FlatList
      data={[{}]}
      renderItem={() => (
        <View className="p-4">
          <Text className="text-lg font-bold">Corporation Requirements</Text>
          <Text className="mb-4">Please fill out the following information</Text>

          <AddressField />

          <View className="mb-2 w-full flex-row items-center justify-center gap-2">
            <View className="flex-1">
              <Text className="my-1 text-sm">BIR Certificate</Text>
              {errors.birCert && (
                <Text className="text-sm text-red-500">{errors.birCert.message}</Text>
              )}
              <PickImage
                onImageSelected={(url) => setValue('birCert', url)}
                title="Upload BIR Certificate"
              />
            </View>
            <View className="flex-1">
              <Text className="my-1 text-sm">BIR Selfie</Text>
              {errors.birCertSelfie && (
                <Text className="text-sm text-red-500">{errors.birCertSelfie.message}</Text>
              )}
              <CameraCapture
                onImageCaptured={(url) => setValue('birCertSelfie', url)}
                title="Take BIR Selfie"
              />
            </View>
          </View>
          <View className="mb-2 w-full flex-row items-center justify-center gap-2">
            <View className="flex-1">
              <Text className="my-1 text-sm">Business Permit</Text>
              {errors.businessPermit && (
                <Text className="text-sm text-red-500">{errors.businessPermit.message}</Text>
              )}
              <PickImage
                onImageSelected={(url) => setValue('businessPermit', url)}
                title="Upload Business Permit"
              />
            </View>
            <View className="flex-1">
              <Text className="my-1 text-sm">Permit Selfie</Text>
              {errors.businessPermitSelfie && (
                <Text className="text-sm text-red-500">{errors.businessPermitSelfie.message}</Text>
              )}
              <CameraCapture
                onImageCaptured={(url) => setValue('businessPermitSelfie', url)}
                title="Take Permit Selfie"
              />
            </View>
          </View>
          <View className="mb-2 w-full flex-row items-center justify-center gap-2">
            <View className="flex-1">
              <Text className="my-1 text-sm">SEC Certificate</Text>
              {errors.secCert && (
                <Text className="text-sm text-red-500">{errors.secCert.message}</Text>
              )}
              <PickImage
                onImageSelected={(url) => setValue('secCert', url)}
                title="Upload SEC Certificate"
              />
            </View>
            <View className="flex-1">
              <Text className="my-1 text-sm">SEC Selfie</Text>
              {errors.secCertSelfie && (
                <Text className="text-sm text-red-500">{errors.secCertSelfie.message}</Text>
              )}
              <CameraCapture
                onImageCaptured={(url) => setValue('secCertSelfie', url)}
                title="Take SEC Selfie"
              />
            </View>
          </View>
          <View className="mb-2 w-full flex-row items-center justify-center gap-2">
            <View className="flex-1">
              <Text className="my-1 text-sm">Articles of Incorporation</Text>
              {errors.secCert && (
                <Text className="text-sm text-red-500">{errors.secCert.message}</Text>
              )}
              <DocumentPicker
                onDocumentSelected={(url) => setValue('artInc', url)}
                title="Upload Articles of Incorporation"
              />
            </View>
          </View>
          {Object.keys(errors).length > 0 && (
            <View className="mt-4 rounded-lg bg-red-50 p-2">
              <Text className="font-bold text-red-600">Form Errors:</Text>
              {Object.entries(errors).map(([field, error]) => (
                <Text key={field} className="text-red-500">
                  {field}: {error.message}
                </Text>
              ))}
            </View>
          )}
          <Buttons
            title="Submit Requirements"
            onPress={() => {
              console.log('Button pressed');
              handleSubmit(onSubmit)();
            }}
          />

          {showAddressModal && (
            <PrimaryModal visible={showAddressModal} onClose={() => setShowAddressModal(false)}>
              <Address
                onSubmit={(data: AddressFormData) => {
                  setValue('corporateLocation', data.address);
                  setShowAddressModal(false);
                }}
              />
            </PrimaryModal>
          )}

          <Alert
            variant="error"
            title="Submission Error"
            message={errorMessage || ''}
            isVisible={!!errorMessage}
            onClose={() => setErrorMessage(null)}
          />

          <Alert
            variant="success"
            title="Success!"
            message={successMessage || ''}
            isVisible={!!successMessage}
            onClose={() => {
              setSuccessMessage(null);
              onCloseModal();
            }}
          />
        </View>
      )}
      keyExtractor={() => 'corporation-form'}
      showsVerticalScrollIndicator={false}
      getItemLayout={(data, index) => ({
        length: 800,
        offset: 800 * index,
        index,
      })}
      initialNumToRender={1}
      maxToRenderPerBatch={1}
      windowSize={5}
      keyboardShouldPersistTaps="handled"
    />
  );
});

export default Corporation;
