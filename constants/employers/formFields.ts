import { EmployerCategory } from '~/types/employers';
import type { FormFieldItem } from '~/types/forms';

export const EMPLOYER_FORM_FIELDS: FormFieldItem[] = [
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
    name: 'contactPerson',
    label: 'Contact Person',
    placeholder: 'Enter business contact person',
  },
  {
    type: 'text',
    name: 'position',
    label: 'Position',
    placeholder: 'Enter your position designation',
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
];
