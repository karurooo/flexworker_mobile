import { AntDesign } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, Alert, FlatList } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { useUserData } from '~/hooks/query/useUserData';
import ProfileHeader from '~/components/Employer/ProfileHeader';
import PersonalInformationForm from '~/components/Jobseeker/PersonalInfo';
import { useState, useCallback, useMemo } from 'react';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import EducationalBackgroundForm from '~/components/Jobseeker/Education';
import CoverLetterForm from '~/components/Jobseeker/CoverLetter';
import JobPreferenceForm from '~/components/Jobseeker/JobPreference';
import JobSkillsForm from '~/components/Jobseeker/JobSkills';
import { useJobseekerData, useJobSeekerSkillsData } from '~/hooks/query/useJobSeekerData';
import React from 'react';
import type { ListRenderItem } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';
import { deleteJobSeekerSkillsData } from '~/services/api/jobseekers/jobseekerDataApi';
import { useQueryClient } from '@tanstack/react-query';
import SecondaryModal from '~/components/Shared/Modal/SecondaryModal';

// Types
type ModalType =
  | 'personal'
  | 'education'
  | 'job-preference'
  | 'cover-letter'
  | 'job-skills'
  | 'logout'
  | null;

interface ProfileSection {
  key: Exclude<ModalType, 'logout' | null>;
  title: string;
  content: any;
  FormComponent: React.ComponentType<any>;
}

// Utility functions for rendering content items (same as before)
const renderEducationItem = (level: string, value: string | undefined, theme: any) => (
  <View className="flex-row items-center justify-between">
    <Text style={theme.fonts.labelMedium} className="text-gray-500">
      {level}
    </Text>
    <Text style={theme.fonts.bodyMedium} className="text-gray-800">
      {value || 'Not specified'}
    </Text>
  </View>
);

const renderJobPreferenceItem = (label: string, value: string | undefined, theme: any) => (
  <View className="flex-row items-center justify-between">
    <Text style={theme.fonts.labelMedium} className="text-gray-500">
      {label}
    </Text>
    <Text style={theme.fonts.bodyMedium} className="text-gray-800">
      {value || 'Not specified'}
    </Text>
  </View>
);

const Profile = () => {
  const theme = useTheme();
  const { data: user } = useUserData();
  const { data: jobSeekerData, refetch: refetchJobSeekerData } = useJobseekerData();
  const { data: jobSeekerSkillsData, refetch: refetchJobSeekerSkills } = useJobSeekerSkillsData();
  const queryClient = useQueryClient();

  // Modal state
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Open modal with animation
  const openModal = useCallback((modalType: ModalType) => {
    setActiveModal(modalType);
    setTimeout(() => {
      setModalVisible(true);
    }, 500);
  }, []);

  // Close modal with proper cleanup
  const handleCloseModal = useCallback(() => {
    setModalVisible(false);
    setTimeout(() => {
      setActiveModal(null);
      refetchJobSeekerData();
      refetchJobSeekerSkills();
    }, 500); // Adjust based on your modal animation duration
  }, [refetchJobSeekerData, refetchJobSeekerSkills]);

  const handleDeleteSkill = useCallback(
    async (id: string) => {
      try {
        await deleteJobSeekerSkillsData(id);
        await queryClient.invalidateQueries({ queryKey: ['jobSeekerSkills'] });
        await queryClient.invalidateQueries({ queryKey: ['matchedJobs', user?.id] });
      } catch (error) {
        console.error('Failed to delete skill:', error);
        Alert.alert('Error', 'Failed to delete skill. Please try again.');
      }
    },
    [queryClient, user?.id]
  );

  const performLogout = useCallback(() => {
    console.log('Logout functionality not implemented');
    handleCloseModal();
  }, [handleCloseModal]);

  // Memoized profile sections (same as before)
  const profileSections = useMemo<ProfileSection[]>(
    () => [
      {
        key: 'personal',
        title: 'Personal Information',
        content: jobSeekerData?.personal_information,
        FormComponent: PersonalInformationForm,
      },
      {
        key: 'education',
        title: 'Education',
        content: jobSeekerData?.educational_background,
        FormComponent: EducationalBackgroundForm,
      },
      {
        key: 'job-preference',
        title: 'Job Preference',
        content: jobSeekerData?.job_preference,
        FormComponent: JobPreferenceForm,
      },
      {
        key: 'cover-letter',
        title: 'Cover Letter',
        content: jobSeekerData?.cover_letter,
        FormComponent: CoverLetterForm,
      },
      {
        key: 'job-skills',
        title: 'Job Skills',
        content: jobSeekerSkillsData,
        FormComponent: JobSkillsForm,
      },
    ],
    [jobSeekerData, jobSeekerSkillsData]
  );

  const formattedAddress = useMemo(() => {
    if (!jobSeekerData?.present_address) return 'No Address';
    const { street, city, region, province, zip_code } = jobSeekerData.present_address;
    const formattedAddress = `${street}, ${city}, ${region}, ${province},  ${zip_code}`;
    return formattedAddress;
  }, [jobSeekerData?.present_address]);

  // Section content rendering (implementation similar to before)
  const renderSectionContent = useCallback(
    (key: ProfileSection['key'], content: any) => {
      if (!content) return <Text className="mt-2 text-gray-500">No information provided</Text>;

      switch (key) {
        case 'personal':
          return (
            <Card.Content className="p-4">
              <View className="flex-1">
                <Text style={theme.fonts.titleMedium} className="font-bold text-gray-900">
                  {content.first_name} {content.last_name}
                </Text>
                <View className="mt-2 flex-row items-center justify-between">
                  <Text style={theme.fonts.labelSmall} className="text-primary font-medium">
                    <FontAwesome6 name="phone" size={14} />{' '}
                    {content.contact_number || 'Not provided'}
                  </Text>
                </View>
                <View className="mt-2 flex-row items-center gap-2">
                  <FontAwesome6 name="map-pin" size={14} />
                  <Text
                    style={theme.fonts.labelSmall}
                    className="text-gray-500"
                    ellipsizeMode="tail"
                    numberOfLines={1}>
                    {formattedAddress}
                  </Text>
                </View>
              </View>
            </Card.Content>
          );
        case 'education':
          return (
            <Card.Content className="p-4">
              <View className="flex-1">
                <View className="mt-2 space-y-2">
                  {renderEducationItem('Elementary', content.elementary, theme)}
                  {renderEducationItem('High School', content.highschool, theme)}
                  {renderEducationItem('Bachelor', content.bachelor, theme)}
                  {renderEducationItem('TechVoc', content.techvoc, theme)}
                </View>
              </View>
            </Card.Content>
          );
        case 'job-preference':
          return (
            <Card.Content className="p-4">
              <View className="flex-1">
                <View className="mt-2 space-y-2">
                  {renderJobPreferenceItem('Work Type', content.work_type, theme)}
                  {renderJobPreferenceItem('Salary Type', content.salary_type, theme)}
                  {renderJobPreferenceItem('Plan To Work', content.plan_to_work, theme)}
                  {renderJobPreferenceItem('Location', content.location, theme)}
                </View>
              </View>
            </Card.Content>
          );
        case 'cover-letter':
          return (
            <Card.Content className="p-4">
              <Text style={theme.fonts.bodySmall} className="mt-2 text-gray-800">
                {content || 'No cover letter provided'}
              </Text>
            </Card.Content>
          );
        case 'job-skills':
          return (
            <Card.Content className="p-4">
              {Array.isArray(content) && content.length > 0 ? (
                content.map((skill, index) => (
                  <View className="flex-row items-center justify-between" key={skill.id || index}>
                    <Text style={theme.fonts.bodySmall} className="mt-2 text-gray-800">
                      {skill.specialization || 'No skill fetched'}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        Alert.alert('Delete Skill', 'Are you sure you want to delete this skill?', [
                          { text: 'Cancel', style: 'cancel' },
                          { text: 'Delete', onPress: () => handleDeleteSkill(skill.id) },
                        ]);
                      }}
                      className="flex-row items-center justify-center rounded-lg px-4 py-2">
                      <AntDesign name="delete" size={16} color="red" />
                    </TouchableOpacity>
                  </View>
                ))
              ) : (
                <Text style={theme.fonts.bodySmall} className="mt-2 text-gray-800">
                  No job skills provided
                </Text>
              )}
            </Card.Content>
          );
        default:
          return null;
      }
    },
    [theme, handleDeleteSkill]
  );

  // Section renderer
  const renderSection = useCallback<ListRenderItem<ProfileSection>>(
    ({ item }) => (
      <View className="mb-6 rounded-lg bg-gray-50 p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-navy">{item.title}</Text>
          <TouchableOpacity
            onPress={() => openModal(item.key)}
            className="bg-primary flex-row items-center justify-center rounded-lg border px-4 py-2"
            activeOpacity={0.7}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}>
            <View className="flex-row items-center">
              <AntDesign name="edit" size={18} color="black" />
              <Text className="ml-2 text-sm font-medium text-black">Edit</Text>
            </View>
          </TouchableOpacity>
        </View>
        {renderSectionContent(item.key, item.content)}
      </View>
    ),
    [renderSectionContent, openModal]
  );

  // Get the current form component
  const renderModalContent = useCallback(() => {
    if (!activeModal || activeModal === 'logout') return null;

    const section = profileSections.find((s) => s.key === activeModal);
    if (!section) return null;

    const FormComponent = section.FormComponent;

    // Log to help debug
    console.log('Rendering form component for', activeModal, 'with data:', section.content);

    // Key form components properly - will force a fresh render on key change
    return (
      <View className="w-full flex-1" key={`form-${activeModal}`}>
        <FormComponent
          initialData={section.content}
          onCloseModal={handleCloseModal}
          onSuccess={handleCloseModal}
        />
      </View>
    );
  }, [activeModal, profileSections, handleCloseModal]);

  return (
    <Container>
      <View className="h-[15%]">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy px-4">
          <ProfileHeader />
        </View>
      </View>

      <View className="flex-1">
        {activeModal && activeModal !== 'logout' && (
          <PrimaryModal visible={modalVisible} onClose={handleCloseModal}>
            {renderModalContent()}
          </PrimaryModal>
        )}

        <FlatList
          data={profileSections}
          renderItem={renderSection}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingBottom: 20 }}
          initialNumToRender={4}
          maxToRenderPerBatch={4}
          windowSize={5}
          removeClippedSubviews
        />
      </View>

      {/* Separate modal rendering for logout */}
      {activeModal === 'logout' && (
        <SecondaryModal
          visible={modalVisible}
          onClose={handleCloseModal}
          onCancel={handleCloseModal}
          onConfirm={performLogout}
          title="Logout Confirmation"
          message="Are you sure you want to logout?"
          confirmText="Logout"
          cancelText="Cancel"
        />
      )}
    </Container>
  );
};

export default React.memo(Profile);
