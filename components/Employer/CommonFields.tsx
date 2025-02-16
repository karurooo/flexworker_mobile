import React, { useState, useMemo, useCallback, memo } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image } from 'react-native';
import FormField from '~/components/Shared/Forms/FormFields';
import Button from '~/components/Shared/Buttons/Button';
import { Control, useForm } from 'react-hook-form';
import { useEmployerMutation } from '~/mutations/query/employers/useEmployerMutation';
import { Employer } from '~/types/employers';
import { zodResolver } from '@hookform/resolvers/zod';
import { employerSchema, EmployerFormData } from '~/schema/employerSchema';

import { EmployerCategory } from '~/types/employers';
import PrimaryModal from '../Shared/Modal/PrimaryModal';
import SecondaryButtons from '../Shared/Buttons/SecondaryButton';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import { KeyboardTypeOptions } from 'react-native';
import Address from '../Shared/Address';
import { AddressFormData } from '~/types/address';
import CameraCapture from '../Shared/CameraCapture';
import PickImage from '../Shared/PickImage';
import { useUserData } from '~/hooks/query/useUserData';
import { useMutation } from '@tanstack/react-query';
import CategoryComponent from '~/components/Employer/Categories';
import { useEmployerData } from '~/hooks/query/useEmployerData';

type Props = {
  onSuccess: (category: EmployerCategory) => void;
};

// Update the FormFieldItem type
type FormFieldItem = {
  type: 'text' | 'dropdown';
  name: keyof Omit<Employer, 'id' | 'created_at' | 'status' | 'user_id'>;
  label: string;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  options?: Array<{ label: string; value: string }>;
};

const CommonFields = ({ onSuccess }: Props) => {
  const {
    control,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<EmployerFormData>({
    resolver: zodResolver(employerSchema),
    defaultValues: {
      category: '',
      companyName: '',
      position: '',
      contactPerson: '',
      contactNumber: '',
      email: '',
      address: {
        region: '',
        province: '',
        city: '',
        street: '',
        barangay: '',
        zipCode: '',
      },
      imageTin: undefined,
      selfieTin: undefined,
    },
  });

  const { mutate, isPending } = useEmployerMutation();
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [address, setAddress] = useState<AddressFormData | null>(null);
  const { data: userData } = useUserData();

  const userId = userData?.id;
  // Update the formFields array
  const formFields = useMemo<FormFieldItem[]>(
    () => [
      {
        type: 'dropdown',
        name: 'category',
        label: 'Employer Category',
        options: Object.values(EmployerCategory).map((value) => ({
          label: value,
          value,
        })),
      },
      {
        type: 'text',
        name: 'companyName',
        label: 'Company Name',
        placeholder: 'Enter company name',
      },
      {
        type: 'text',
        name: 'position',
        label: 'Position',
        placeholder: 'Enter your position',
      },
      {
        type: 'text',
        name: 'contactPerson',
        label: 'Contact Person',
        placeholder: 'Enter business contact person',
      },
      {
        type: 'text',
        name: 'contactNumber',
        label: 'Phone',
        placeholder: 'Enter business contact number',
        keyboardType: 'phone-pad',
      },
      {
        type: 'text',
        name: 'email',
        label: 'Business Email',
        placeholder: 'Enter business email',
        keyboardType: 'email-address',
      },
    ],
    []
  );

  // Update the renderItem function
  const renderItem = useCallback(
    ({ item }: { item: FormFieldItem }) => {
      if (item.type === 'dropdown') {
        return (
          <DropdownFormField<EmployerFormData>
            control={control}
            name={item.name}
            label={item.label}
            options={item.options || []}
            error={errors[item.name as keyof EmployerFormData]?.message}
          />
        );
      }

      return (
        <FormField
          control={control}
          name={item.name as keyof EmployerFormData}
          label={item.label}
          placeholder={item.placeholder}
          keyboardType={item.keyboardType}
          error={errors[item.name as keyof EmployerFormData]?.message as string}
        />
      );
    },
    [control, errors]
  );
  const handleAddressSubmit = (data: AddressFormData) => {
    setAddress(data); // Update the address state
    setValue('address', data.address); // Update the form values
    setShowAddressForm(false); // Close the modal
  };

  const [selectedCategory, setSelectedCategory] = useState<EmployerCategory | null>(null);
  const [showDocumentModal, setShowDocumentModal] = useState(false);
  const { data: employer } = useEmployerData();
  console.log('employer data', employer);

  const handleApplicationSubmit = useCallback(
    (formData: EmployerFormData) => {
      if (!userId) {
        console.error('User ID not found');
        return;
      }

      const payload: Omit<Employer, 'id' | 'created_at'> = {
        user_id: userId,
        ...formData,
        category: formData.category as EmployerCategory,
        address: formData.address,
      };

      mutate(payload, {
        onSuccess: () => {
          setSelectedCategory(formData.category as EmployerCategory);
          setShowDocumentModal(true);
          console.log('Selected Category', formData.category);
          onSuccess(formData.category as EmployerCategory);
        },
        onError: (error) => {
          console.error('Mutation error:', error);
          alert('Submission failed. Please check your inputs.');
        },
      });
    },
    [userId, mutate, onSuccess]
  );

  return (
    <View className="h-full w-full rounded-2xl p-3">
      <FlatList
        data={formFields}
        renderItem={renderItem}
        keyExtractor={(item) => item.name.toString()}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <Text className="text-bold  text-2xl font-bold">Employer Information</Text>
            <Text className=" text-md  mb-4">Please fill out the following information</Text>
          </>
        }
        ListFooterComponent={
          <>
            <View className="mt-1">
              <Text className="text-bold text-background text-md ">Business Address</Text>
              {!address ? (
                <SecondaryButtons title="Add Address" onPress={() => setShowAddressForm(true)} />
              ) : (
                <TouchableOpacity
                  className="border-background rounded-lg border p-2"
                  onPress={() => setShowAddressForm(true)}>
                  <Text className="gap-2">
                    {`${address?.address.street ?? ''}, ${address?.address.barangay ?? ''}, ${address?.address.city ?? ''}, ${address?.address.province ?? ''}, ${address?.address.region ?? ''}, ${address?.address.zipCode ?? ''}`}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
            <View className="mb-2 w-full flex-row items-center justify-center gap-2 ">
              {/* TIN Image Section */}
              <View className=" flex-1">
                <Text className=" my-1 text-sm">TIN Image Upload</Text>
                <PickImage
                  onImageSelected={(url) => setValue('imageTin', url)}
                  title="Upload TIN Image"
                />
              </View>

              {/* Selfie with TIN Section */}
              <View className=" flex-1">
                <Text className=" my-1 text-sm">Selfie with TIN ID</Text>
                <CameraCapture
                  onImageCaptured={(url) => setValue('selfieTin', url)}
                  title="Take Selfie with TIN"
                />
              </View>
            </View>
            <Text className="mb-4  text-sm text-gray-600">
              Note: Use the Image button to upload a file and the Camera button to take a selfie
              with the certificate.
            </Text>
            <Button
              title="Submit"
              onPress={handleSubmit(handleApplicationSubmit)}
              disabled={isPending}
            />
          </>
        }
        getItemLayout={(data, index) => ({
          length: 80, // Average item height
          offset: 80 * index,
          index,
        })}
        initialNumToRender={6}
        maxToRenderPerBatch={5}
        windowSize={7}
        keyboardShouldPersistTaps="handled"
      />

      {showAddressForm && (
        <PrimaryModal visible={showAddressForm} onClose={() => setShowAddressForm(false)}>
          <Address onSubmit={handleAddressSubmit} />
        </PrimaryModal>
      )}

      {showDocumentModal && selectedCategory && (
        <PrimaryModal visible={showDocumentModal} onClose={() => setShowDocumentModal(false)}>
          <CategoryComponent
            category={selectedCategory}
            onCloseModal={() => setShowDocumentModal(false)}
          />
        </PrimaryModal>
      )}
    </View>
  );
};

export default React.memo(CommonFields);
