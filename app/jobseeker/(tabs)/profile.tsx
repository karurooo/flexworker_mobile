import { AntDesign } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, FlatList, Alert } from 'react-native';
import CameraCapture from '~/components/Shared/CameraCapture';
import PickImage from '~/components/Shared/PickImage';
import ProfilePicture from '~/components/Shared/ProfilePicture';
import { Container } from '~/components/Shared/Container';
import { useUserData } from '~/hooks/query/useUserData';
import { useUserStore } from '~/store/users';
import { capitalizeWords } from '~/utils/strings';
import ProfileHeader from '~/components/Employer/ProfileHeader';
import PersonalInformationForm from '~/components/Jobseeker/PersonalInfo';
import { useState } from 'react';
import SecondaryButtons from '~/components/Shared/Buttons/SecondaryButton';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import EducationalBackgroundForm from '~/components/Jobseeker/Education';
import CoverLetterForm from '~/components/Jobseeker/CoverLetter';
import JobPreferenceForm from '~/components/Jobseeker/JobPreference';
import JobSkillsForm from '~/components/Jobseeker/JobSkills';
import { useJobseekerData, useJobSeekerSkillsData } from '~/hooks/query/useJobSeekerData';
import React from 'react';
import type { ListRenderItem } from 'react-native';
import { Card } from 'react-native-paper';
import { FontAwesome6 } from '@expo/vector-icons';
import { useTheme } from 'react-native-paper';
import { deleteJobSeekerSkillsData } from '~/services/api/jobseekers/jobseekerDataApi';
import { useQueryClient } from '@tanstack/react-query'; // Import useQueryClient

interface ProfileSection {
  key: 'personal' | 'education' | 'job-preference' | 'cover-letter' | 'job-skills';
  title: string;
  content: any;
  modalControl: (value: boolean) => void;
}

const formatAddress = (address: any) => {
  return `${address.street}, ${address.barangay}, ${address.city}, ${address.province}`;
};

const renderEducationLevel = (level: string, value: string) => {
  return value ? (
    <View className="flex-row">
      <Text className="font-semibold">{level}:</Text>
      <Text className="ml-2 flex-1">{value}</Text>
    </View>
  ) : null;
};

const formatLocation = (location: string | object) => {
  try {
    const loc = typeof location === 'string' ? JSON.parse(location) : location;
    const parts = [
      loc.region,
      loc.province,
      loc.city,
      loc.barangay,
      loc.street,
      loc.zipCode ? ` ${loc.zipCode}` : null,
    ].filter(Boolean);
    return parts.join(', ').replace(/, (\d)/, ' $1');
  } catch (e) {
    return typeof location === 'string' ? location : 'Location not specified';
  }
};

const Profile = React.memo(() => {
  const theme = useTheme();
  const { data: user, isLoading, isError } = useUserData();
  const [personalInfo, setPersonalInfo] = useState(false);
  const [education, setEducation] = useState(false);
  const [coverLetter, setCoverLetter] = useState(false);
  const [jobPreference, setJobPreference] = useState(false);
  const [jobSkills, setJobSkills] = useState(false);

  const { data: jobSeekerData } = useJobseekerData();
  const { data: jobSeekerSkillsData, refetch: refetchJobSeekerSkills } = useJobSeekerSkillsData();
  const queryClient = useQueryClient(); // Initialize queryClient

  const handleDeleteSkill = async (id: string) => {
    try {
      await deleteJobSeekerSkillsData(id);

      // Refetch job skills data
      await refetchJobSeekerSkills();

      // Invalidate the matchedJobs query to trigger a refetch
      await queryClient.invalidateQueries({ queryKey: ['matchedJobs', user?.id] });

      console.log('Skill deleted successfully', id);
    } catch (error) {
      console.error('Failed to delete skill:', error);
    }
  };

  const profileSections = React.useMemo<ProfileSection[]>(
    () => [
      {
        key: 'personal',
        title: 'Personal Information',
        content: jobSeekerData?.personal_information,
        modalControl: setPersonalInfo,
      },
      {
        key: 'education',
        title: 'Education',
        content: jobSeekerData?.educational_background,
        modalControl: setEducation,
      },
      {
        key: 'job-preference',
        title: 'Job Preference',
        content: jobSeekerData?.job_preference,
        modalControl: setJobPreference,
      },
      {
        key: 'cover-letter',
        title: 'Cover Letter',
        content: jobSeekerData?.cover_letter,
        modalControl: setCoverLetter,
      },
      {
        key: 'job-skills',
        title: 'Job Skills',
        content: jobSeekerSkillsData,
        modalControl: setJobSkills,
      },
    ],
    [jobSeekerData, jobSeekerSkillsData]
  );

  const renderSection = React.useCallback<ListRenderItem<ProfileSection>>(
    ({ item }) => (
      <View className="mb-6 rounded-lg bg-gray-50 p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-navy">{item.title}</Text>
          <TouchableOpacity
            onPress={() => item.modalControl(true)}
            className="bg-primary flex-row items-center justify-center rounded-lg px-4 py-2">
            <AntDesign name="edit" size={18} color="black" />
            <Text className="ml-2 text-sm font-medium text-black">Edit</Text>
          </TouchableOpacity>
        </View>
        {renderSectionContent(item.key, item.content)}
      </View>
    ),
    [jobSeekerData]
  );

  const renderSectionContent = (
    key: 'personal' | 'education' | 'job-preference' | 'cover-letter' | 'job-skills',
    content: any
  ) => {
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
                  <FontAwesome6 name="phone" size={14} /> {content.contact_number || 'Not provided'}
                </Text>
                <Text style={theme.fonts.labelSmall} className="text-gray-500">
                  <FontAwesome6 name="map-marker" size={14} />{' '}
                  {content.present_address?.street ? 'Address Provided' : 'No Address'}
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
                {renderEducationItem('Elementary', content.elementary)}
                {renderEducationItem('High School', content.highschool)}
                {renderEducationItem('Bachelor', content.bachelor)}
                {renderEducationItem('TechVoc', content.techvoc)}
              </View>
            </View>
          </Card.Content>
        );

      case 'job-preference':
        return (
          <Card.Content className="p-4">
            <View className="flex-1">
              <View className="mt-2 space-y-2">
                {renderJobPreferenceItem('Work Type', content.work_type)}
                {renderJobPreferenceItem('Salary Type', content.salary_type)}
                {renderJobPreferenceItem('Plan To Work', content.plan_to_work)}
                {renderJobPreferenceItem('Location', content.location)}
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
                <View className="flex-row items-center justify-between" key={index}>
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
  };

  const renderEducationItem = (level: string, value: string) => (
    <View className="flex-row items-center justify-between">
      <Text style={theme.fonts.labelMedium} className="text-gray-500">
        {level}
      </Text>
      <Text style={theme.fonts.bodyMedium} className="text-gray-800">
        {value || 'Not specified'}
      </Text>
    </View>
  );

  const renderJobPreferenceItem = (level: string, value: string) => (
    <View className="flex-row items-center justify-between">
      <Text style={theme.fonts.labelMedium} className="text-gray-500">
        {level}
      </Text>
      <Text style={theme.fonts.bodyMedium} className="text-gray-800">
        {value || 'Not specified'}
      </Text>
    </View>
  );

  return (
    <Container>
      <View className="h-[15%]">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy px-4">
          <ProfileHeader />
        </View>
        {/* Modals */}
        {personalInfo && (
          <PrimaryModal visible={personalInfo} onClose={() => setPersonalInfo(false)}>
            <PersonalInformationForm onCloseModal={() => {}} />
          </PrimaryModal>
        )}
        {education && (
          <PrimaryModal visible={education} onClose={() => setEducation(false)}>
            <EducationalBackgroundForm />
          </PrimaryModal>
        )}
        {coverLetter && (
          <PrimaryModal visible={coverLetter} onClose={() => setCoverLetter(false)}>
            <CoverLetterForm />
          </PrimaryModal>
        )}
        {jobPreference && (
          <PrimaryModal visible={jobPreference} onClose={() => setJobPreference(false)}>
            <JobPreferenceForm onCloseModal={() => setJobPreference(false)} />
          </PrimaryModal>
        )}
        {jobSkills && (
          <PrimaryModal visible={jobSkills} onClose={() => setJobSkills(false)}>
            <JobSkillsForm onCloseModal={() => setJobSkills(false)} />
          </PrimaryModal>
        )}
      </View>

      <FlatList
        data={profileSections}
        renderItem={renderSection}
        keyExtractor={(item) => item.key}
        initialNumToRender={4}
        maxToRenderPerBatch={4}
        windowSize={5}
        removeClippedSubviews
      />
    </Container>
  );
});

export default Profile;
