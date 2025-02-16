import { z } from 'zod';

export const addressSchema = z.object({
  address: z.object({
    region: z.string(),
    province: z.string(),
    city: z.string(),
    barangay: z.string(),
    street: z.string(),
    zipCode: z.string(),
  }),
});

export type AddressFormData = {
  address: {
    region: string;
    regionCode?: string;
    province: string;
    provinceCode?: string;
    city: string;
    cityCode?: string;
    barangay: string;
    street: string;
    zipCode: string;
  };
};
