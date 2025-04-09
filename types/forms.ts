import { KeyboardTypeOptions } from 'react-native';

export type FormFieldType = 'text' | 'dropdown';

export type EmployerFormFieldName =
  | 'category'
  | 'companyName'
  | 'position'
  | 'contactPerson'
  | 'contactNumber'
  | 'email'
  | 'address'
  | 'imageTin'
  | 'selfieTin';

export interface FormFieldBase<T extends FormFieldType> {
  type: T;
  name: EmployerFormFieldName;
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  keyboardType?: KeyboardTypeOptions;
}

export interface TextField extends FormFieldBase<'text'> {
  // Additional text-specific properties can go here
}

export interface DropdownField extends FormFieldBase<'dropdown'> {
  options: Array<{ label: string; value: string }>;
}

export type FormFieldItem = TextField | DropdownField;
