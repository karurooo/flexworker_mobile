export interface PSGCItem {
  code: string;
  name: string;
}

export interface AddressFormData {
  address: {
    region: string;
    province: string;
    city: string;
    barangay: string;
    street: string;
    zipCode: string;
  };
}

export type AddressLevel = 'region' | 'province' | 'city' | 'barangay';
