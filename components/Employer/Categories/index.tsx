import React, { memo } from 'react';
import { Text, View, Button } from 'react-native';
import Corporation from '~/components/Employer/Categories/Corporation';
import Government from '~/components/Employer/Categories/Government';
import SoleProprietorship from '~/components/Employer/Categories/SoleProprietorship';

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
    // Automatically close modal when mounted
    React.useEffect(() => {
      onCloseModal();
    }, []);

    return (
      <View className="p-4">
        <Text className="mb-4 text-lg font-bold">Private Requirements</Text>
      </View>
    );
  },
};

const CategoryComponent: React.FC<CategoriesProps> = memo(({ category, onCloseModal }) => {
  const CategoryForm = categoryComponents[category] || (() => <Text>Invalid category</Text>);
  return <CategoryForm onCloseModal={onCloseModal} />;
});

export default CategoryComponent;
