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

interface NotificationItemProps {
  notification: Notification;
  onPress: () => void;
}

const NotificationItem = memo(
  ({ notification, onPress }: NotificationItemProps) => {
    const theme = useTheme();
    const [detailsModalVisible, setDetailsModalVisible] = useState(false);
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const timeoutRef = React.useRef<NodeJS.Timeout>();

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
          null,
          2
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

    return (
      <>
        <Animated.View
          entering={FadeIn.duration(300)}
          exiting={FadeOut.duration(200)}
          layout={LinearTransition.duration(250)}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handleItemPress}
            accessibilityLabel={`Notification: ${notification.title}`}>
            <Card
              className="bg-surface mx-2 my-1 overflow-hidden rounded-xl shadow-md"
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
                    {notification.title}
                  </Text>
                  {!notification.is_read && <View className="bg-primary h-2 w-2 rounded-full" />}
                </View>
                <Text
                  variant="bodyMedium"
                  className="mt-2 leading-5"
                  style={{ color: theme.colors.onSurfaceVariant }}>
                  {notification.message}
                </Text>
                {notification.metadata?.job_title && (
                  <Text variant="labelSmall" className="text-primary mt-2 font-medium">
                    Position: {notification.metadata?.job_title}
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
              <Text variant="titleMedium" className=" font-bold text-gray-900">
                {notification.title}
              </Text>

              {notification.metadata?.senderName && (
                <Text className=" text-sm text-gray-600">
                  From: <Text className="font-semibold">{notification.metadata.senderName}</Text>
                </Text>
              )}
              <View className=" flex-row  gap-2">
                <Text className="text-sm text-gray-500">{date},</Text>
                <Text className="text-sm text-gray-500">{time}</Text>
              </View>
            </View>

            <Text variant="bodyMedium" className="mb-4  text-gray-700">
              {notification.message}
            </Text>

            {notification.metadata?.job_title && (
              <View className="mb-4">
                <Text className="text-primary text-sm font-medium">Position:</Text>
                <Text className="text-sm text-gray-600">{notification.metadata?.job_title} </Text>
              </View>
            )}
            <SecondaryButtons title="See Profile" onPress={handleViewProfile} />
          </View>
        </SecondaryModal>

        <PrimaryModal visible={profileModalVisible} onClose={handleCloseProfile}>
          <ApplicantProfile
            metadata={notification.metadata?.applicantProfile}
            jobPostingId={resolvedJobPostingId}
          />
        </PrimaryModal>
      </>
    );
  },
  (prev, next) =>
    prev.notification.id === next.notification.id &&
    prev.notification.is_read === next.notification.is_read
);

export default NotificationItem;
