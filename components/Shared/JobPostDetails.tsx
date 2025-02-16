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
import { getJobseekerData } from '~/services/api/jobseekers/jobseekerDataApi';
import { useJobseekerData } from '~/hooks/query/useJobSeekerData';

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

interface JobDetailsModalProps {
  visible: boolean;
  onClose: () => void;
  job: JobPost | null;
  isEmployerView?: boolean;
}

const JobDetailsModal = memo(({ visible, onClose, job, isEmployerView }: JobDetailsModalProps) => {
  const theme = useTheme();
  const { data: userData } = useUserData();
  const { data: profile } = useJobseekerData();
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
    if (!profile) {
      setAlertType('error');
      setAlertMessage('Profile not loaded - please try again');
      return;
    }

    try {
      const { isAuthenticated } = useUserStore.getState();
      console.log(isAuthenticated, userId);
      // Validate authentication
      if (!isAuthenticated || !userId) {
        setAlertType('error');
        setAlertMessage('Please log in to apply');
        router.push('/auth/signin');
        return;
      }

      // Validate job ID
      if (!job?.id) {
        setAlertType('error');
        setAlertMessage('Invalid job listing');
        return;
      }

      // Check required profile fields
      if (!profile.personal_information) {
        setAlertType('error');
        setAlertMessage('Complete your personal information before applying');
        router.push('/jobseeker/profile');
        return;
      }

      setIsApplying(true);

      // Submit application
      const applicationResult = await ApplicationService.applyToJob(job.id, userId);

      if (applicationResult.error) {
        throw new Error(applicationResult.error.message);
      }

      // Send notification
      await NotificationService.sendApplicationNotification(job, userData.id, profile);

      // Update state
      setApplicationStatus('pending');
      setAlertType('success');
      setAlertMessage('Application submitted successfully!');
    } catch (error) {
      let errorMessage = 'Application failed';
      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === 'object' && error !== null && 'message' in error) {
        errorMessage = String(error.message);
      }

      setAlertType('error');
      setAlertMessage(
        errorMessage.includes('already applied')
          ? 'You already applied to this position'
          : errorMessage
      );
    } finally {
      setIsApplying(false);
      setShowAlert(true);
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
            {job.company_name}
          </Text> */}
        </View>

        {/* Key Details */}
        <View className="mb-4 flex-row justify-between">
          <View className="flex-1">
            <Text variant="bodyMedium" className="text-gray-500">
              Industry
            </Text>
            <Text variant="labelMedium">{job.job_industry}</Text>
          </View>
          <View className="flex-1">
            <Text variant="bodyMedium" className="text-gray-500">
              Type
            </Text>
            <Text variant="labelMedium">{job.job_type}</Text>
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

        <Button
          title={applicationStatus ? applicationStatus.toUpperCase() : 'Apply'}
          onPress={handleApply}
          disabled={isApplying || !!applicationStatus}
          variant={isApplying || applicationStatus ? 'disabled' : 'primary'}
        />

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

export default JobDetailsModal;
