import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList, ActivityIndicator } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { NotificationService } from '~/services/api/notifications';
import { useNotificationStore } from '~/store/notifications';
import NotificationItem from '~/components/Shared/NotificationItem';
import SearchBar from '~/components/Shared/Search';
import { useUserData } from '~/hooks/query/useUserData';
import { useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import Alert from '~/components/Shared/Alerts';
import Header from '~/components/Shared/Header';

export default function Notification() {
  const { notifications, markAsRead } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useUserData();
  const userId = user?.id;
  const [refreshing, setRefreshing] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  const router = useRouter();
  const [loadError, setLoadError] = useState('');
  const filteredNotifications = useMemo(
    () =>
      notifications.filter((n) => {
        // Only show application_update type notifications
        const isApplicationUpdate = n.type === 'application_update';

        const matchesSearch =
          n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.message?.toLowerCase().includes(searchQuery.toLowerCase());

        return isApplicationUpdate && matchesSearch;
      }),
    [notifications, searchQuery]
  );

  useEffect(() => {
    if (!userId) return;

    const subscription = NotificationService.subscribeToNotifications(userId, (newNotification) => {
      if (newNotification.is_read) {
        useNotificationStore.getState().markAsRead(newNotification.id);
      } else if (!notifications.some((n) => n.id === newNotification.id)) {
        useNotificationStore.getState().addNotification(newNotification);
      }
    });

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId, notifications]);

  useFocusEffect(
    useCallback(() => {
      const loadNotifications = async () => {
        try {
          if (!userId) {
            throw new Error('User session invalid');
          }

          const data = await NotificationService.getUserNotifications(userId);
          useNotificationStore.getState().setNotifications(data);
          setError(null);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Failed to load notifications';

          setLoadError(errorMessage);
          setError(errorMessage);
        } finally {
          setLoading(false);
        }
      };

      loadNotifications();
    }, [userId])
  );

  useEffect(() => {
    console.log('Job Seeker Notifications:', {
      all: notifications,
      filtered: filteredNotifications,
      counts: {
        total: notifications.length,
        filtered: filteredNotifications.length,
      },
    });
  }, [filteredNotifications]);

  useEffect(() => {
    console.log(
      'Application Update Metadata:',
      filteredNotifications.filter((n) => n.type === 'application_update').map((n) => n.metadata)
    );
  }, [filteredNotifications]);

  const [updateTrigger, setUpdateTrigger] = useState(0);

  useEffect(() => {
    const newUnread = notifications.filter((n) => !n.is_read);
    if (newUnread.length > 0) {
      console.log('New unread notifications:', newUnread.length);
    }
  }, [notifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      // Update Supabase first
      await NotificationService.markAsRead(id);
      // Then optimistically update local state
      useNotificationStore.getState().markAsRead(id);
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  return (
    <Container>
      {loadError && (
        <Alert isVisible variant="error" title="Notification Error" message={loadError} />
      )}
      <View className="h-[15%] ">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy ">
          <Header />
        </View>
      </View>
      <View className=" mx-4 h-[85%] flex-1">
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <NotificationItem
              notification={item}
              onPress={() => handleMarkAsRead(item.id)}
              variant="jobseeker"
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="p-4">
              {loading ? (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              ) : error ? (
                <Text className="text-center text-red-500">{error}</Text>
              ) : (
                <Text className="text-center text-gray-500">No notifications found</Text>
              )}
            </View>
          }
        />
      </View>
    </Container>
  );
}
