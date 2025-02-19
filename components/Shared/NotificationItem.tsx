import { memo, useState, useCallback, useMemo } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Card, useTheme, Text } from 'react-native-paper';
import Animated, { FadeIn, FadeOut, LinearTransition } from 'react-native-reanimated';
import { Notification } from '~/types/notifications';
import PrimaryModal from './Modal/PrimaryModal';
import React from 'react';
import SecondaryModal from './Modal/SecondaryModal';
import Buttons from './Buttons/Button';
import SecondaryButtons from './Buttons/SecondaryButton';
import ApplicantProfile from '../Jobseeker/ApplicantProfile';
import NextSteps from './NextStep';
import { useUserData } from '~/hooks/query/useUserData';
import Alert from './Alerts';

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
  variant?: 'employer' | 'jobseeker';
}

const NotificationItem = memo(
  ({ notification, onPress, variant = 'employer' }: NotificationItemProps) => {
    const theme = useTheme();
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [responseModal, setResponseModal] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout>();
    const { data: userData } = useUserData();
    const role = userData?.role;
    const [viewReasons, setViewReasons] = useState(false);
    const [viewInstructions, setInstructions] = useState(false);
    const { date, time } = useMemo(() => {
      const date = new Date(notification.created_at);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        }),
      };
    }, [notification.created_at]);

    const resolvedJobPostingId = useMemo(() => {
      return (
        notification.metadata?.jobId ||
        notification.metadata?.employer?.id ||
        notification.job_posting_id ||
        'invalid-job-id'
      );
    }, [notification]);

    const [error, setError] = useState<string | null>(null);
    const [showAlert, setShowAlert] = useState(false);

    const handleError = useCallback((message: string) => {
      setError(message);
      setShowAlert(true);
    }, []);

    const handleCloseAlert = useCallback(() => {
      setShowAlert(false);
      setError(null);
    }, []);

    const handleItemPress = useCallback(() => {
      console.log(
        'Selected notification data:',
        JSON.stringify(
          {
            id: notification.id,
            type: notification.type,
            metadata: notification.metadata,
            raw_job_id: notification.job_posting_id,
            resolvedJobPostingId,
          },
          null
        )
      );

      onPress();
      setDetailsModalVisible(true);
    }, [onPress, notification, resolvedJobPostingId]);

    const handleViewProfile = useCallback(() => {
      setDetailsModalVisible(false);
      setTimeout(() => setProfileModalVisible(true), 150);
    }, []);

    const handleCloseProfile = useCallback(() => {
      setProfileModalVisible(false);
      setTimeout(() => onPress(), 150);
    }, [onPress]);

    const handleViewResponse = useCallback(() => {
      setDetailsModalVisible(false);
      setTimeout(() => setProfileModalVisible(true), 150);
    }, []);

    const isJobSeekerView = variant === 'jobseeker';

    const isEmployerApplication = notification.type === 'employer_application';
    const applicationStatus = notification.metadata?.application_status || 'pending';

    const notificationContent = useMemo(() => {
      switch (notification.type) {
        case 'accepted':
          return {
            title: '🎉 You Got Hired!',
            message: `Congratulations! You've been selected for ${notification.metadata?.job_postings?.job_title} at ${notification.metadata?.employer?.company_name}`,
          };
        case 'rejected':
          return {
            title: 'Application Update',
            message: `Your application for ${notification.metadata?.job_postings?.job_title} wasn't selected`,
          };
        case 'job_alert':
          return {
            title: 'New Job Match!',
            message: `We found a "${notification.metadata?.job_postings?.job_title}" position matching your profile`,
          };
        case 'application_update':
          return {
            title: `Application ${notification.metadata?.decision?.toUpperCase()}`,
            message: `Your application for ${notification.metadata?.job_title} at ${notification.metadata?.employer?.company_name} was ${notification.metadata?.decision}`,
          };
        case 'job_application':
          return {
            title: notification.title,
            message: notification.message,
          };
        case 'employer_application':
          return {
            title: 'Employer Application Status',
            message: notification.message,
          };
        default:
          return {
            title: notification.title,
            message: notification.message,
          };
      }
    }, [notification, isJobSeekerView]);

    const isAdminResponse = notification.type === 'employer_application';
    const isApproved = notification.metadata?.admin_decision === 'approved';

    return (
      <>
        {showAlert && (
          <Alert
            isVisible={showAlert}
            variant="error"
            title="Notification Error"
            message={error || 'Failed to load notification details'}
            onClose={handleCloseAlert}
          />
        )}

        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.duration(250)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleItemPress}
            accessibilityLabel={`Notification: ${notification.title}`}>
            <Card
              className={`mx-2 my-1 overflow-hidden rounded-xl shadow-md ${
                isEmployerApplication
                  ? applicationStatus === 'approved'
                    ? 'bg-green-50'
                    : applicationStatus === 'rejected'
                      ? 'bg-red-50'
                      : 'bg-blue-50'
                  : 'bg-surface'
              }`}
              style={{
                borderLeftWidth: notification.is_read ? 0 : 4,
                borderLeftColor: theme.colors.primary,
              }}>
              <Card.Content className="p-4">
                <View className="flex-row items-start justify-between">
                  <Text
                    variant="titleMedium"
                    numberOfLines={2}
                    className="flex-1 pr-2 font-medium"
                    style={{ color: theme.colors.onSurface }}>
                    {notificationContent.title}
                  </Text>
                  {!notification.is_read && <View className="bg-primary h-2 w-2 rounded-full" />}
                </View>
                <Text
                  variant="bodyMedium"
                  className="mt-2 leading-5"
                  style={{ color: theme.colors.onSurfaceVariant }}>
                  {notificationContent.message}
                </Text>

                {isEmployerApplication && (
                  <>
                    <Text variant="labelSmall" className="text-outline mt-2">
                      Company: {notification.metadata?.company_name}
                    </Text>
                    <Text variant="labelSmall" className="text-outline mt-1">
                      Applied on:{' '}
                      {new Date(
                        notification.metadata?.submitted_at ?? Date.now()
                      ).toLocaleDateString()}
                    </Text>
                  </>
                )}

                {notification.metadata?.job_postings?.job_title && (
                  <Text variant="labelSmall" className="text-primary mt-2 font-medium">
                    Position: {notification.metadata?.job_postings?.job_title}
                  </Text>
                )}

                <Text variant="labelSmall" className="text-outline mt-2">
                  {date} • {time}
                </Text>
              </Card.Content>
            </Card>
          </TouchableOpacity>
        </Animated.View>

        <SecondaryModal visible={detailsModalVisible} onClose={() => setDetailsModalVisible(false)}>
          <View className="justify-center p-2">
            <View className="mb-4">
              <Text variant="titleMedium" className="font-bold text-gray-900">
                {notificationContent.title}
              </Text>

              {isEmployerApplication && (
                <Text className="text-sm text-gray-600">
                  Company:{' '}
                  <Text className="font-semibold">{notification.metadata?.company_name}</Text>
                </Text>
              )}

              <View className="mt-2 flex-row gap-2">
                <Text className="text-sm text-gray-500">{date},</Text>
                <Text className="text-sm text-gray-500">{time}</Text>
              </View>
            </View>

            <Text variant="bodyMedium" className="mb-4 text-gray-700">
              {notificationContent.message}
            </Text>

            {isEmployerApplication && (
              <View className="mb-4">
                <Text className="text-sm font-medium text-gray-900">Application Details:</Text>
                <Text className="text-sm text-gray-600">
                  Status: {applicationStatus.toUpperCase()}
                </Text>
                <Text className="mt-1 text-sm text-gray-600">
                  Submitted on:{' '}
                  {new Date(notification.metadata?.submitted_at ?? Date.now()).toLocaleDateString()}
                </Text>
              </View>
            )}

            {notification.metadata?.job_postings?.job_title && (
              <View className="mb-4">
                <Text className="text-primary text-sm font-medium">Position:</Text>
                <Text className="text-sm text-gray-600">
                  {notification.metadata?.job_postings?.job_title}
                </Text>
              </View>
            )}

            {notification.type === 'job_application' && (
              <SecondaryButtons title="See Profile" onPress={handleViewProfile} />
            )}

            {notification.type === 'application_update' && (
              <View className="mt-3">
                {notification.metadata?.decision === 'accepted' && (
                  <>
                    <Text className="text-primary text-sm font-semibold">Hiring Instructions:</Text>
                    <Text className="text-sm text-gray-600">
                      {notification.metadata?.instructions || 'No specific instructions provided'}
                    </Text>
                  </>
                )}

                {notification.metadata?.decision === 'rejected' && (
                  <>
                    <SecondaryButtons title="View Profile" onPress={handleViewProfile} />
                    <SecondaryModal visible={responseModal} onClose={handleCloseProfile}>
                      <View className="m-2">
                        <Text className="text-error text-sm font-semibold">Rejection Reasons:</Text>
                        <Text className="text-sm text-gray-600">
                          {notification.metadata?.rejectionReasons ||
                            'No specific reasons provided'}
                        </Text>
                      </View>
                    </SecondaryModal>
                  </>
                )}
              </View>
            )}
          </View>
        </SecondaryModal>

        <PrimaryModal visible={profileModalVisible} onClose={handleCloseProfile}>
          <ApplicantProfile
            metadata={notification.metadata?.applicantProfile}
            jobPostingId={resolvedJobPostingId}
            jobTitle={
              notification.metadata?.job_postings?.job_title ||
              notification.metadata?.job_title ||
              ''
            }
          />
        </PrimaryModal>
        {/* <SecondaryModal visible={responseModal} onClose={handleCloseProfile}>
            <NextSteps
              status={notification.metadata?.decision || 'pending'}
              metadata={notification.metadata}
            />
          </SecondaryModal> */}
      </>
    );
  },
  (prev, next) =>
    prev.notification.id === next.notification.id &&
    prev.notification.is_read === next.notification.is_read
);

export default NotificationItem;
