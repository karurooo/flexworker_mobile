import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { AntDesign, MaterialIcons } from '@expo/vector-icons';
import SecondaryModal from '../Shared/Modal/SecondaryModal';
import CommonFields from './CommonFields';
import PrimaryModal from '../Shared/Modal/PrimaryModal';
import CategoryComponent from './Categories';
import { EmployerCategory } from '~/types/employers';
import { useEmployerData, useEmployerStatus } from '~/hooks/query/useEmployerData';
import SecondaryButtons from '../Shared/Buttons/SecondaryButton';
import {
  useAcceptedApplicants,
  useTotalApplicants,
  useTotalPostedJobs,
} from '~/hooks/query/useJobData';

const Stats: React.FC = ({}) => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<EmployerCategory | null>(null);

  const { data: status } = useEmployerStatus();
  const { data: employerData } = useEmployerData();
  console.log('Employer Status: ', status);
  const handleSuccess = (category: EmployerCategory) => {
    setShowApplicationModal(false);
    setSelectedCategory(category);
  };

  const employerId = employerData?.id;

  const { data: totalApplicants } = useTotalApplicants(employerId);
  const { data: totalPosted } = useTotalPostedJobs(employerId);
  const { data: totalAccepted } = useAcceptedApplicants(employerId);
  console.log('Total Applicants: ', totalApplicants);
  console.log('Total Posted: ', totalPosted);
  console.log('Total Accepted: ', totalAccepted);

  return (
    <View className="flex-row items-center justify-between gap-4 px-2 py-2">
      {/* Posted */}
      <View className="flex-1 items-center">
        <View className="rounded-full border border-navy p-3">
          <MaterialIcons name="post-add" size={20} color="black" />
        </View>
        <Text className="mt-1 text-sm ">Posted</Text>
        <Text className="text-md font-semibold text-gray-900">{totalPosted}</Text>
      </View>

      <TouchableOpacity className="flex-1 items-center" onPress={() => {}} activeOpacity={0.7}>
        <View className="rounded-full border border-navy p-3">
          <AntDesign name="adduser" size={20} color="#166534" />
        </View>
        <Text className="mt-1 text-sm text-gray-600">Applied</Text>
        <Text className="text-md font-semibold text-gray-900">{totalApplicants}</Text>
      </TouchableOpacity>

      <View className="flex-1 items-center">
        <View className="rounded-full border border-navy p-3">
          <AntDesign name="checkcircle" size={20} color="#4BB543" />
        </View>
        <Text className="mt-1 text-sm text-gray-600">Accepted</Text>
        <Text className="text-md font-semibold text-gray-900">{totalAccepted}</Text>
      </View>
      <View className="flex-1  rounded-lg border border-gray-200 px-2 py-1">
        {!employerData && !status && status === 'Rejected' ? (
          <SecondaryButtons
            title="Apply"
            className=" rounded-lg border border-gray-600 px-2 py-1"
            onPress={() => setShowApplicationModal(true)}
            activeOpacity={0.7}>
            <Text className="text-sm ">Apply</Text>
          </SecondaryButtons>
        ) : (
          status && (
            <View className="items-center justify-between gap-1">
              <View className="rounded-full border border-navy p-3">
                <MaterialIcons name="pending" size={20} color="#4BB543" />
              </View>
              <Text className="text-sm text-gray-600">Status</Text>
              <Text
                className={`text-sm font-medium ${
                  status === 'Approved' ? 'text-green-600' : 'text-yellow-600'
                }`}
                numberOfLines={1}
                ellipsizeMode="tail">
                {status}
              </Text>
            </View>
          )
        )}
      </View>

      <PrimaryModal visible={showApplicationModal} onClose={() => setShowApplicationModal(false)}>
        <CommonFields onSuccess={handleSuccess} />
      </PrimaryModal>

      <PrimaryModal visible={!!selectedCategory} onClose={() => setSelectedCategory(null)}>
        {selectedCategory && (
          <CategoryComponent
            category={selectedCategory}
            onCloseModal={() => setSelectedCategory(null)}
          />
        )}
      </PrimaryModal>
    </View>
  );
};

export default Stats;
