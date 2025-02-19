import { ScrollView, View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Card, useTheme } from 'react-native-paper';
import { Notification } from '~/types/notifications';
import { memo, useMemo, useCallback, useState, useEffect } from 'react';
import type {
  EducationalBackground,
  JobPreference,
  Location,
  PersonalInformation,
} from '~/types/notifications';
import Buttons from '../Shared/Buttons/Button';
import SecondaryButtons from '../Shared/Buttons/SecondaryButton';
import React from 'react';
import { NotificationService } from '~/services/api/notifications';
import { useUserStore } from '~/store/users';
import { useUserData } from '~/hooks/query/useUserData';
import { useRouter } from 'expo-router';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import Alert from '../Shared/Alerts';
import NextStep from '~/components/Shared/NextStep';
import SecondaryModal from '../Shared/Modal/SecondaryModal';

interface ApplicantProfileProps {
  metadata?: {
    id: string;
    personal_information: PersonalInformation;
    educational_background: EducationalBackground;
    job_preference: JobPreference;
    present_address: Location;
    cover_letter: string;
    applicantSkills?: Array<{ industry: string; specialization: string }>;
  };
  jobPostingId: string;
  jobTitle?: string;
}

type ApplicantSkill = {
  industry: string;
  specialization: string;
};

const ApplicantProfile = memo(({ metadata, jobPostingId, jobTitle }: ApplicantProfileProps) => {
  if (!jobPostingId) {
    return (
      <Alert
        isVisible={true}
        variant="error"
        title="Invalid Job Reference"
        message="Cannot process application without job reference"
      />
    );
  }

  console.log('Id: ', metadata?.id);
  const router = useRouter();
  const { data: employer } = useEmployerData();
  const formatLocation = (loc: Location) =>
    `${loc.street ? loc.street + ', ' : ''}${loc.barangay}, ${loc.city}, ${loc.province}`;

  // Memoize expensive calculations
  const { formattedLocation, formattedName } = useMemo(
    () => ({
      formattedLocation: metadata ? formatLocation(metadata.present_address) : '',
      formattedName: metadata
        ? `${metadata.personal_information.first_name} ${metadata.personal_information.middle_name}. ${metadata.personal_information.last_name}`
        : '',
    }),
    [metadata]
  );

  // Optimized section rendering
  const renderSection = useCallback(
    (title: string, content: React.ReactNode) => (
      <Card className="mb-4">
        <Card.Title title={title} />
        <Card.Content>{content}</Card.Content>
      </Card>
    ),
    []
  );

  const { data: user, isLoading } = useUserData();
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');

  // Add state for modal
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [currentAction, setCurrentAction] = useState<'hire' | 'reject'>('hire');

  useEffect(() => {
    if (!jobPostingId) {
      console.error('Missing jobPostingId:', metadata);
      setAlertType('error');
      setAlertMessage('Job reference not found - please refresh');
      setAlertVisible(true);
    }
  }, [jobPostingId]);

  if (isLoading) return <ActivityIndicator />;

  if (!metadata)
    return (
      <View className="p-4">
        <Text className="text-gray-500">No applicant data available</Text>
      </View>
    );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

  const handleHire = useCallback(
    async (instructions: string) => {
      try {
        setAlertVisible(false);

        if (!employer?.id) {
          throw new Error('Employer information missing');
        }

        await NotificationService.sendHireDecision({
          applicantId: metadata.id,
          jobId: jobPostingId,
          decision: 'Approved',
          employer: employer,
          jobTitle: jobTitle || '',
          instructions: instructions,
          receiverId: metadata.id,
        });

        console.log('Notification sent with metadata:', {
          decision: 'accepted',
          jobTitle: jobTitle,
          company: employer.company_name,
          instructions: instructions,
        });

        setAlertType('success');
        setAlertMessage(`${formattedName} has been hired successfully!`);
        setAlertVisible(true);

        // Close modal after success
        setTimeout(() => {
          setAlertVisible(false);
          router.back();
        }, 2000);
      } catch (error) {
        setAlertType('error');
        setAlertMessage(
          error instanceof Error
            ? `Hire processed but notification failed: ${error.message}`
            : 'Hire completed with partial errors'
        );
        setAlertVisible(true);
      }
    },
    [jobPostingId, metadata, employer, formattedName, router]
  );

  const handleReject = useCallback(
    async (reasons: string) => {
      try {
        setAlertVisible(false);

        if (!employer?.id) {
          throw new Error('Employer information missing');
        }

        await NotificationService.sendHireDecision({
          applicantId: metadata.id,
          jobId: jobPostingId,
          decision: 'Rejected',
          employer: employer,
          jobTitle: jobTitle || '',
          rejectionReasons: reasons,
          receiverId: metadata.id,
        });

        console.log('Notification sent with metadata:', {
          decision: 'rejected',
          jobTitle: jobTitle,
          company: employer.company_name,
          reasons: reasons,
        });

        setAlertType('success');
        setAlertMessage(`${formattedName} has been notified of the rejection`);
        setAlertVisible(true);

        setTimeout(() => {
          setAlertVisible(false);
          router.back();
        }, 2000);
      } catch (error) {
        setAlertType('error');
        setAlertMessage(
          error instanceof Error
            ? `Hire processed but notification failed: ${error.message}`
            : 'Hire completed with partial errors'
        );
        setAlertVisible(true);
      }
    },
    [jobPostingId, metadata, employer, formattedName, router]
  );

  console.log('Applicant Profile Metadata:', JSON.stringify(metadata, null, 2));

  return (
    <>
      <FlatList
        data={[
          {
            key: 'personal',
            content: (
              <>
                <InfoRow label="Name" value={formattedName} />
                <InfoRow label="Contact" value={metadata.personal_information.contact_number} />
                <InfoRow label="Address" value={formattedLocation} />
                <InfoRow label="Sex" value={metadata.personal_information.sex} />
                <InfoRow label="Religion" value={metadata.personal_information.religion} />
              </>
            ),
          },
          {
            key: 'education',
            content: (
              <>
                <InfoRow label="Elementary" value={metadata.educational_background.elementary} />
                <InfoRow label="High School" value={metadata.educational_background.highschool} />
                <InfoRow
                  label="Bachelor's Degree"
                  value={metadata.educational_background.bachelor}
                />
                <InfoRow label="Tech/Vocational" value={metadata.educational_background.techvoc} />
              </>
            ),
          },
          {
            key: 'preferences',
            content: (
              <>
                <InfoRow label="Work Type" value={metadata.job_preference.work_type} />
                <InfoRow label="Salary Type" value={metadata.job_preference.salary_type} />
                <InfoRow
                  label="Salary Range"
                  value={`₱${metadata.job_preference.min_salary} - ₱${metadata.job_preference.max_salary}`}
                />
                <InfoRow label="Location Preference" value={metadata.job_preference.location} />
              </>
            ),
          },
          {
            key: 'skills',
            content: (
              <>
                {metadata.applicantSkills?.map((skill: ApplicantSkill, index: number) => (
                  <View key={`skill-${index}`} className="mb-4">
                    <InfoRow label="Industry" value={skill.industry} />
                    <InfoRow label="Specialization" value={skill.specialization} />
                  </View>
                ))}
              </>
            ),
          },
        ]}
        renderItem={({ item }) =>
          renderSection(
            item.key === 'personal'
              ? 'Personal Information'
              : item.key === 'education'
                ? 'Education'
                : item.key === 'preferences'
                  ? 'Job Preferences'
                  : 'Skills',
            item.content
          )
        }
        keyExtractor={(item) => item.key}
        ListFooterComponent={
          <>
            {metadata.cover_letter &&
              renderSection(
                'Cover Letter',
                <Text className="text-gray-600">{metadata.cover_letter}</Text>
              )}
            <Buttons
              title="Hire Applicant"
              onPress={() => {
                setCurrentAction('hire');
                setShowFeedbackModal(true);
              }}
            />
            <SecondaryButtons
              title="Reject Applicant"
              onPress={() => {
                setCurrentAction('reject');
                setShowFeedbackModal(true);
              }}
              className="mt-2"
            />
          </>
        }
        initialNumToRender={2}
        maxToRenderPerBatch={3}
        windowSize={5}
        removeClippedSubviews
        contentContainerStyle={{ padding: 16 }}
      />

      {showFeedbackModal && (
        <SecondaryModal visible={showFeedbackModal} onClose={() => setShowFeedbackModal(false)}>
          <NextStep
            status={currentAction === 'hire' ? 'accepted' : 'rejected'}
            onSubmit={(text) => {
              currentAction === 'hire' ? handleHire(text) : handleReject(text);
              setShowFeedbackModal(false);
            }}
            isInputMode={true}
          />
        </SecondaryModal>
      )}

      {alertVisible && (
        <Alert
          isVisible={alertVisible}
          variant={alertType}
          title={alertType === 'success' ? 'Success' : 'Error'}
          message={alertMessage}
          onClose={() => setAlertVisible(false)}
        />
      )}
    </>
  );
});

const InfoRow = memo(({ label, value }: { label: string; value?: string }) => (
  <View className="flex-row gap-2 border-b border-gray-100 py-2">
    <Text className="flex-1 text-gray-500">{label}</Text>
    <View className="border border-gray-300" />
    <Text className="flex-1 text-gray-700">{value || 'N/A'}</Text>
  </View>
));

export default ApplicantProfile;
