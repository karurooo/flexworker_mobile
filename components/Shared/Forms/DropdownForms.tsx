import React, { useMemo } from 'react';
import { Controller, Control, FieldValues, Path } from 'react-hook-form';
import Dropdown from '../Dropdown';
import { View, Text } from 'react-native';

interface DropdownOption {
  label: string;
  value: string;
}

interface DropdownFormFieldProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
  label: string;
  options: (string | DropdownOption)[];
  placeholder?: string;
  error?: string;
  onSelect?: (value: string) => void;
}

const DropdownFormField = React.memo(<T extends FieldValues>(props: DropdownFormFieldProps<T>) => {
  const { control, name, label, options, placeholder = 'Select', error, onSelect } = props;

  // Memoize options processing
  const processedOptions = useMemo(
    () => options.map((opt) => (typeof opt === 'string' ? { label: opt, value: opt } : opt)),
    [options]
  );

  return (
    <View className="mb-4">
      <Text className=" mb-1 ">{label}</Text>
      <Controller
        control={control}
        name={name}
        render={({ field }) => (
          <Dropdown
            options={processedOptions}
            keyboardShouldPersistTaps="handled"
            onSelect={(value) => {
              field.onChange(value);
              onSelect?.(value);
            }}
            placeholder={placeholder}
            value={field.value}
          />
        )}
      />
      {error && <Text className="mt-1 text-sm text-red-500">{error}</Text>}
    </View>
  );
}) as <T extends FieldValues>(props: DropdownFormFieldProps<T>) => JSX.Element;

export default DropdownFormField;
