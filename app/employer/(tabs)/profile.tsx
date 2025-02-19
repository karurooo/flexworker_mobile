import { View, Text } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { useUserData } from '~/hooks/query/useUserData';
import { useUserStore } from '~/store/users';
import ProfileHeader from '~/components/Employer/ProfileHeader';
import Stats from '~/components/Employer/ProfileStats';
import { useState } from 'react';
import PrimaryModal from '~/components/Shared/Modal/PrimaryModal';
import ExtendedFab from '~/components/Shared/ExtendedFab';
import JobPost from '~/components/Employer/JobPost';
import PostedJobsList from '~/components/Employer/PostedJobs';
import { usePostedJobs } from '~/hooks/query/useJobData';
import { useEmployerData, useEmployerStatus } from '~/hooks/query/useEmployerData';

export default function Profile() {
  const { data: user } = useUserData();
  const [showModal, setShowModal] = useState(false);
  const { data: employer, isLoading: employerLoading, error: employerError } = useEmployerData();
  const { data: status } = useEmployerStatus();

  const isApproved = status === 'Approved';
  const employerId = employer?.id;
  const { data: posts } = usePostedJobs(employerId ?? '');

  if (employerLoading) {
    return (
      <Container>
        <Text>Loading employer profile...</Text>
      </Container>
    );
  }

  if (employerError) {
    return (
      <Container>
        <Text className="text-red-500">Error loading employer data: {employerError.message}</Text>
      </Container>
    );
  }

  console.log('This is my posts: ', posts);
  return (
    <Container>
      <View className="h-[15%] bg-white">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy px-4">
          <ProfileHeader />
        </View>
      </View>
      <View className=" mx-4 h-[85%] flex-1">
        <Stats />
        <PostedJobsList />

        <ExtendedFab
          onPress={() => isApproved && setShowModal(true)}
          iconName={'add'}
          disabled={!isApproved}
          disabledHint="Complete verification to post jobs"
        />
        {showModal && (
          <PrimaryModal
            visible={showModal}
            onClose={() => setShowModal(false)}
            avoidKeyboard={true}>
            <JobPost onCloseModal={() => setShowModal(false)} />
          </PrimaryModal>
        )}
      </View>
    </Container>
  );
}
