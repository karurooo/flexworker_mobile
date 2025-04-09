import { useQueryClient } from '@tanstack/react-query';
import React, { memo, useState } from 'react';
import { Text, View, Button, ActivityIndicator } from 'react-native';
import Corporation from '~/components/Employer/Categories/Corporation';
import Government from '~/components/Employer/Categories/Government';
import SoleProprietorship from '~/components/Employer/Categories/SoleProprietorship';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import { postEmployerStatus } from '~/services/api/employers/statusDataApi';
import { MaterialIcons } from '@expo/vector-icons';

import { EmployerCategory } from '~/types/employers';

interface EmployerProps {
  onCloseModal: () => void;
}

interface CategoriesProps {
  category: EmployerCategory;
  onCloseModal: () => void;
}

const categoryComponents: Record<EmployerCategory, React.ComponentType<EmployerProps>> = {
  [EmployerCategory.GOVERNMENT]: Government,
  [EmployerCategory.CORPORATION]: Corporation,
  [EmployerCategory.SOLE_PROPRIETORSHIP]: SoleProprietorship,
  [EmployerCategory.PRIVATE]: ({ onCloseModal }) => {
    const { data: employerData } = useEmployerData();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const employerId = employerData?.id;

    React.useEffect(() => {
      const submitStatus = async () => {
        if (!employerId || isSubmitting) return;

        setIsSubmitting(true);
        setError(null);

        try {
          await postEmployerStatus(employerId);
          await queryClient.invalidateQueries({
            queryKey: ['employerStatus', 'employerData'],
          });
          onCloseModal();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
          setIsSubmitting(false);
        }
      };

      submitStatus();
    }, [employerId, onCloseModal, queryClient, isSubmitting]);

    return (
      <View className="p-4">
        <Text className="mb-4 text-lg font-bold">Private Employer Setup</Text>

        {isSubmitting ? (
          <View className="flex-row items-center gap-2">
            <ActivityIndicator color="#166534" />
            <Text className="text-gray-600">Updating your status...</Text>
          </View>
        ) : error ? (
          <View className="flex-row items-center gap-2">
            <MaterialIcons name="error-outline" size={20} color="#dc2626" />
            <Text className="text-red-600">{error}</Text>
          </View>
        ) : (
          <Text className="text-gray-600">
            Your private employer status was successfully updated
          </Text>
        )}
      </View>
    );
  },
};

const CategoryComponent: React.FC<CategoriesProps> = memo(({ category, onCloseModal }) => {
  const CategoryForm = categoryComponents[category] || (() => <Text>Invalid category</Text>);
  return <CategoryForm onCloseModal={onCloseModal} />;
});

export default CategoryComponent;
