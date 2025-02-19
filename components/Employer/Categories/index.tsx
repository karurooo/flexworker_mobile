import { useQueryClient } from '@tanstack/react-query';
import React, { memo } from 'react';
import { Text, View, Button } from 'react-native';
import Corporation from '~/components/Employer/Categories/Corporation';
import Government from '~/components/Employer/Categories/Government';
import SoleProprietorship from '~/components/Employer/Categories/SoleProprietorship';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import { postEmployerStatus } from '~/services/api/employers/statusDataApi';

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
    const employerId = employerData?.id;
    const queryClient = useQueryClient();
    React.useEffect(() => {
      if (employerId) {
        postEmployerStatus(employerId).then(() => {
          queryClient.invalidateQueries({ queryKey: ['employerStatus'] });
          onCloseModal();
        });
        onCloseModal();
      }
    }, [employerId, onCloseModal]);

    return (
      <View className="p-4">
        <Text className="mb-4 text-lg font-bold">Private Requirements</Text>
        <Text className="text-gray-600">
          Your private employer status has been automatically approved
        </Text>
      </View>
    );
  },
};

const CategoryComponent: React.FC<CategoriesProps> = memo(({ category, onCloseModal }) => {
  const CategoryForm = categoryComponents[category] || (() => <Text>Invalid category</Text>);
  return <CategoryForm onCloseModal={onCloseModal} />;
});

export default CategoryComponent;
