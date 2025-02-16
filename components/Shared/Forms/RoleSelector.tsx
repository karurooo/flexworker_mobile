import React from 'react';
import { Controller } from 'react-hook-form';
import { View, Text } from 'react-native';
import RadioButton from '~/components/Shared/Buttons/RadioButton';
import { ROLES } from '~/constants/auth/roles';

interface RoleSelectorProps {
  control: any;
  error?: string;
}

const RoleSelector = React.memo(({ control, error }: RoleSelectorProps) => (
  <Controller
    control={control}
    name="role"
    render={({ field }) => (
      <View>
        <Text className="text-lg font-medium">Register as:</Text>
        <View className="flex-row gap-2">
          {ROLES.map((role) => (
            <MemoizedRadioButton
              key={role.value}
              label={role.label}
              selected={field.value === role.value}
              onPress={() => field.onChange(role.value)}
              error={error}
            />
          ))}
        </View>
        {error && <Text className="text-error mt-1 text-sm">{error}</Text>}
      </View>
    )}
  />
));

const MemoizedRadioButton = React.memo(RadioButton);

export default RoleSelector;
