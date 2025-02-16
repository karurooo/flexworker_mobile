import { AntDesign } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, ScrollView, FlatList } from 'react-native';
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
import { useJobseekerData } from '~/hooks/query/useJobSeekerData';
import React from 'react';
import type { ListRenderItem } from 'react-native';

interface ProfileSection {
  key: 'personal' | 'education' | 'job-preference' | 'cover-letter';
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

const Profile = React.memo(() => {
  const { data: user, isLoading, isError } = useUserData();
  const [personalInfo, setPersonalInfo] = useState(false);
  const [education, setEducation] = useState(false);
  const [coverLetter, setCoverLetter] = useState(false);
  const [jobPreference, setJobPreference] = useState(false);

  const { data: jobSeekerData } = useJobseekerData();

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
    ],
    [jobSeekerData]
  );

  const renderSection = React.useCallback<ListRenderItem<ProfileSection>>(
    ({ item }) => (
      <View className="mb-6 rounded-lg bg-gray-50 p-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-navy">{item.title}</Text>
          <SecondaryButtons title="Edit" onPress={() => item.modalControl(true)} className="w-24" />
        </View>
        {renderSectionContent(item.key, item.content)}
      </View>
    ),
    [jobSeekerData]
  );

  const renderSectionContent = (
    key: 'personal' | 'education' | 'job-preference' | 'cover-letter',
    content: any
  ) => {
    if (!content) return <Text className="mt-2 text-gray-500">No information provided</Text>;

    switch (key) {
      case 'personal':
        return (
          <View className="mt-2 space-y-2">
            <Text className="text-base">{`Name: ${content.first_name} ${content.last_name}`}</Text>
            <Text className="text-base">{`Contact: ${content.contact_number || 'Not provided'}`}</Text>
            <Text className="text-base">{`Address: ${content.present_address?.street ? formatAddress(content.present_address) : 'Not provided'}`}</Text>
          </View>
        );
      case 'education':
        return (
          <View className="mt-2 space-y-2">
            {renderEducationLevel('Elementary', content.elementary)}
            {renderEducationLevel('High School', content.highschool)}
            {renderEducationLevel('Bachelor', content.bachelor)}
            {renderEducationLevel('TechVoc', content.techvoc)}
          </View>
        );
      case 'job-preference':
        return (
          <View className="mt-2 space-y-2">
            <Text className="text-base">{`Industry: ${content.job_industry || 'Not specified'}`}</Text>
            <Text className="text-base">{`Type: ${content.work_type || 'Not specified'}`}</Text>
            <Text className="text-base">{`Location: ${content.location || 'Not specified'}`}</Text>
          </View>
        );
      case 'cover-letter':
        return <Text className="mt-2 text-base">{content || 'No cover letter provided'}</Text>;
      default:
        return null;
    }
  };

  return (
    <Container>
      <View className="h-[15%] bg-white">
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
