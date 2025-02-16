import { useQuery } from '@tanstack/react-query';
import { PSGCItem, AddressLevel } from '~/types/address';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { addressSchema, AddressFormData } from '~/schema/addressSchema';
const API_BASE = 'https://psgc.cloud/api';

const useAddressData = (level: AddressLevel, parentCode?: string) => {
  const url = {
    region: `${API_BASE}/regions`,
    province: `${API_BASE}/regions/${parentCode}/provinces`,
    city: `${API_BASE}/provinces/${parentCode}/cities-municipalities`,
    barangay: `${API_BASE}/cities-municipalities/${parentCode}/barangays`,
  }[level];

  return useQuery<PSGCItem[]>({
    queryKey: [level, parentCode],
    queryFn: async () => {
      const response = await fetch(url);
      return response.json();
    },
    enabled: !!parentCode || level === 'region',
    select: (data) =>
      data.map((item: any) => ({
        code: item.code,
        name: item.name,
      })),
    staleTime: Infinity,
  });
};

const useAddressForm = () => {
  return useForm<AddressFormData>({
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
};
export { useAddressData, useAddressForm };
