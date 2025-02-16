import React, { memo, useState, useEffect } from 'react';
import { ScrollView, View } from 'react-native';
import { useTheme, Text, Divider } from 'react-native-paper';
import SecondaryModal from '~/components/Shared/Modal/SecondaryModal';
import { FontAwesome6 } from '@expo/vector-icons';
import { JobPost } from '~/types/employers';
import Button from '~/components/Shared/Buttons/Button';
import { NotificationService } from '~/services/api/notifications';
import { useUserStore } from '~/store/users';
import { ApplicationService } from '~/services/api/jobseekers/applications';
import { ApplicationStatus } from '~/types/applications';
import Alert from '~/components/Shared/Alerts';
import { useNavigation } from '@react-navigation/native';
import { router } from 'expo-router';
import { useUserData } from '~/hooks/query/useUserData';

// Add location formatting function
export const formatLocation = (location: string | object) => {
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
    return typeof location === 'string' ? location : 'Location available upon application';
  }
};

interface PostDetailProps {
  visible: boolean;
  onClose: () => void;
  job: JobPost | null;
  isEmployerView?: boolean;
}

const PostDetail = memo(({ visible, onClose, job, isEmployerView }: PostDetailProps) => {
  const theme = useTheme();
  const { data: userData } = useUserData();
  const userId = userData?.id;

  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [applicationError, setApplicationError] = useState<string | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertType, setAlertType] = useState<'success' | 'error' | 'info'>('info');
  const [alertMessage, setAlertMessage] = useState('');

  useEffect(() => {
    const checkApplicationStatus = async () => {
      if (userId && job?.id) {
        const { status } = await ApplicationService.getApplicationStatus(job.id, userId);
        setApplicationStatus(status ?? null);
      }
    };

    checkApplicationStatus();
  }, [userId, job?.id]);

  if (!job) return null;

  const handleApply = async () => {
    const { isAuthenticated } = useUserStore.getState();

    if (!isAuthenticated || !userId) {
      setAlertType('error');
      setAlertMessage('Please log in to apply');
      onClose();
      router.push('/auth/signin');
      return;
    }

    const applicationResult = await submitApplication(userId);
    if (applicationResult.success) {
      await NotificationService.sendApplicationNotification(job, userId, userData?.profile);
    }
  };

  const submitApplication = async (userId: string) => {
    console.log('id:', userId);
    if (!job?.id) return { success: false, error: 'Invalid job' };

    setIsApplying(true);
    setShowAlert(true);

    try {
      const { data, error } = await ApplicationService.applyToJob(job.id, userId);
      console.log('user id is:', userId);
      if (error?.message.includes('already applied')) {
        setAlertType('error');
        setAlertMessage('You have already applied to this job');
        setApplicationStatus('pending');
        return { success: false };
      }

      if (error?.message.includes('Complete your')) {
        setAlertType('error');
        setAlertMessage(`${error.message} - Redirecting to profile...`);
        return { success: false };
      }

      if (error) {
        setAlertType('error');
        setAlertMessage(error.message || 'Failed to submit application');
        throw error;
      }

      if (!data) {
        setAlertType('error');
        setAlertMessage('Application submission failed - please try again');
        throw new Error('No application data returned');
      }

      setAlertType('success');
      setAlertMessage('Application submitted successfully!');
      setApplicationStatus('pending');
      return { success: true };
    } catch (error) {
      // Error handling remains as fallback
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setAlertType('error');
      setAlertMessage(errorMessage);
      return { success: false };
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <SecondaryModal visible={visible} onClose={onClose} avoidKeyboard={false}>
      <ScrollView className="px-2" showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View className="mb-4">
          <Text variant="headlineSmall" className="font-bold text-gray-900">
            {job.job_title}
          </Text>
          {/* <Text variant="titleMedium" className="text-primary">
            {job.company_name}x
          </Text> */}
        </View>

        {/* Key Details */}
        <View className="mb-4 flex-row justify-between">
          <View className="flex-1">
            <Text variant="labelMedium" className="text-gray-500">
              Industry
            </Text>
            <Text variant="bodyMedium">{job.job_industry}</Text>
          </View>
          <View className="flex-1">
            <Text variant="labelMedium" className="text-gray-500">
              Type
            </Text>
            <Text variant="bodyMedium">{job.job_type}</Text>
          </View>
        </View>

        {/* Salary */}
        {job.salary_type && (
          <View className="mb-4">
            <Text variant="labelMedium" className="text-gray-500">
              Salary
            </Text>
            <View className="flex-row items-center">
              <FontAwesome6 name="peso-sign" size={14} color={theme.colors.primary} />
              <Text variant="bodyMedium" className="ml-1">
                {job.min_salary} - {job.max_salary} ({job.salary_type})
              </Text>
            </View>
          </View>
        )}

        {/* Location */}
        <View className="mb-4">
          <Text variant="labelMedium" className="text-gray-500">
            Location
          </Text>
          <Text variant="bodyMedium">{formatLocation(job.location)}</Text>
        </View>

        {/* Description */}
        <View className="mb-4">
          <Text variant="labelMedium" className="text-gray-500">
            Job Description
          </Text>
          <Text variant="bodyMedium" className="leading-5">
            {job.description}
          </Text>
        </View>

        {/* Requirements - now optional
        {job.requirements && (
          <View className="mb-4">
            <Text variant="labelMedium" className="text-gray-500">
              Requirements
            </Text>
            <Text variant="bodyMedium" className="leading-5">
              {job.requirements}
            </Text>
          </View>
        )} */}

        {/* How to Apply - now optional
        <View className="mb-4">
          <Text variant="labelMedium" className="text-gray-500">
            How to Apply
          </Text>
          <Text variant="bodyMedium" className="leading-5">
            {job.how_to_apply || 'Please submit your application through our company website.'}
          </Text>
        </View> */}

        {showAlert && (
          <Alert
            variant={alertType}
            title={alertType === 'success' ? 'Application Sent!' : 'Application Issue'}
            message={alertMessage}
            isVisible={showAlert}
            onClose={() => {
              setShowAlert(false);
              if (alertMessage.includes('Redirecting')) {
                router.push('/jobseeker/(tabs)/home');
              }
            }}
          />
        )}
      </ScrollView>
    </SecondaryModal>
  );
});

export default PostDetail;
