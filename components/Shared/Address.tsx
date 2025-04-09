import React, { useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FormProvider } from 'react-hook-form';
import { ScrollView, View, FlatList, Text } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import DropdownFormField from '~/components/Shared/Forms/DropdownForms';
import { AddressFormData, addressSchema } from '~/schema/addressSchema';
import FormField from '~/components/Shared/Forms/FormFields';
import { useAddressData } from '~/hooks/query/useAddressData';
import Button from '~/components/Shared/Buttons/Button';

interface AddressPickerProps {
  onSubmit: (data: AddressFormData) => void;
}

interface Region {
  name: string;
  provinces: Province[];
}

interface Province {
  name: string;
  cities: City[];
}

interface City {
  name: string;
  barangays: string[];
}

interface FormSectionItem {
  type: 'dropdown' | 'input';
  name: keyof AddressFormData['address'];
  label: string;
  options?: string[];
  onSelect?: (value: string) => void;
}

const AddressPicker: React.FC<AddressPickerProps> = ({ onSubmit }) => {
  const methods = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      address: {
        region: '',
        province: '',
        city: '',
        barangay: '',
        street: '',
        zipCode: '',
      },
    },
  });

  const { control, setValue, watch } = methods;
  const address = watch('address');

  // Data fetching hooks
  const { data: regions } = useAddressData('region');
  const { data: provinces } = useAddressData('province', address.regionCode);
  const { data: cities } = useAddressData('city', address.provinceCode);
  const { data: barangays } = useAddressData('barangay', address.cityCode);

  // Region selection handler
  const handleRegionSelect = useCallback(
    (value: string) => {
      const region = regions?.find((r) => r.name === value);
      setValue(
        'address',
        {
          region: value,
          regionCode: region?.code || '',
          province: '',
          provinceCode: '',
          city: '',
          cityCode: '',
          barangay: '',
          street: '',
          zipCode: '',
        },
        { shouldValidate: true }
      );
    },
    [regions, setValue]
  );

  // Province selection handler
  const handleProvinceSelect = useCallback(
    (value: string) => {
      const province = provinces?.find((p) => p.name === value);
      setValue(
        'address',
        {
          ...address,
          province: value,
          provinceCode: province?.code || '',
          city: '',
          cityCode: '',
          barangay: '',
        },
        { shouldValidate: true }
      );
    },
    [provinces, address, setValue]
  );

  // City selection handler
  const handleCitySelect = useCallback(
    (value: string) => {
      const city = cities?.find((c) => c.name === value);
      setValue(
        'address',
        {
          ...address,
          city: value,
          cityCode: city?.code || '',
          barangay: '',
        },
        { shouldValidate: true }
      );
    },
    [cities, address, setValue]
  );

  // Text input handlers
  const handleStreetChange = useCallback(
    (text: string) => setValue('address.street', text, { shouldValidate: true }),
    [setValue]
  );

  const handleZipCodeChange = useCallback(
    (text: string) =>
      setValue('address.zipCode', text.replace(/[^0-9]/g, ''), {
        shouldValidate: true,
      }),
    [setValue]
  );

  // Convert form sections to FlatList data
  const formSections = useMemo<FormSectionItem[]>(
    () => [
      {
        type: 'dropdown',
        name: 'region',
        label: 'Region*',
        options: regions?.map((r) => r.name) || [],
        onSelect: handleRegionSelect,
      },
      {
        type: 'dropdown',
        name: 'province',
        label: 'Province*',
        options: provinces?.map((p) => p.name) || [],
        onSelect: handleProvinceSelect,
      },
      {
        type: 'dropdown',
        name: 'city',
        label: 'City*',
        options: cities?.map((c) => c.name) || [],
        onSelect: handleCitySelect,
      },
      {
        type: 'dropdown',
        name: 'barangay',
        label: 'Barangay*',
        options: barangays?.map((b) => b.name) || [],
      },
      { type: 'input', name: 'street', label: 'Street*' },
      { type: 'input', name: 'zipCode', label: 'Zip Code*' },
    ],
    [regions, provinces, cities, barangays]
  );

  // Split renderItem into separate memoized component
  const MemoizedDropdown = React.memo(DropdownFormField<AddressFormData>);

  const renderItem = useCallback(
    ({ item }: { item: FormSectionItem }) => {
      if (item.type === 'dropdown') {
        return (
          <MemoizedDropdown
            control={control}
            name={`address.${item.name}` as keyof AddressFormData}
            label={item.label}
            options={item.options || []}
            onSelect={item.onSelect}
          />
        );
      }

      return (
        <FormField
          control={control}
          name={`address.${item.name}` as keyof AddressFormData}
          label={item.label}
          placeholder={`Enter ${item.label.replace('*', '')}`}
          onChangeText={item.name === 'zipCode' ? handleZipCodeChange : handleStreetChange}
          keyboardType={item.name === 'zipCode' ? 'numeric' : 'default'}
          maxLength={item.name === 'zipCode' ? 4 : undefined}
        />
      );
    },
    [control, handleZipCodeChange, handleStreetChange]
  );

  return (
    <FormProvider {...methods}>
      <FlatList
        data={formSections}
        renderItem={renderItem}
        keyExtractor={(item) => `${item.name}-${item.type}`}
        ListHeaderComponent={
          <View className="py-2">
            <Text className="text-bold  text-2xl font-bold">Address Information</Text>
            <Text className="text-bold text-md  mb-4">
              Please fill out the following information
            </Text>
          </View>
        }
        ListFooterComponent={
          <View className="my-4">
            <Button title="Proceed" onPress={methods.handleSubmit(onSubmit)} />
          </View>
        }
        getItemLayout={(data, index) => ({
          length: 80, // Estimated row height
          offset: 80 * index,
          index,
        })}
        initialNumToRender={6}
        maxToRenderPerBatch={6}
        windowSize={3}
        removeClippedSubviews
        contentContainerStyle={{ paddingHorizontal: 8 }}
      />
    </FormProvider>
  );
};

export default React.memo(AddressPicker);
