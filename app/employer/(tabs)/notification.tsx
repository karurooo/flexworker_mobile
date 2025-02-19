import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState, useEffect } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { NotificationService } from '~/services/api/notifications';
import { useNotificationStore } from '~/store/notifications';
import NotificationItem from '~/components/Shared/NotificationItem';
import Search from '~/components/Shared/Search';
import { useUserStore } from '~/store/users';
import { useUserData } from '~/hooks/query/useUserData';

export default function Notification() {
  const { notifications, markAsRead } = useNotificationStore();
  const [searchTerm, setSearchTerm] = React.useState('');
  const { data: user } = useUserData();
  const userId = user?.id;
  const [refreshing, setRefreshing] = React.useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);
  const [updateTrigger, setUpdateTrigger] = useState(0);

  const filteredNotifications = notifications.filter(
    (n) =>
      (n.type === 'job_application' || n.type === 'employer_application') && // Show both types
      (n.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        n.message?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Load initial notifications
  useEffect(() => {
    loadNotifications();
  }, [userId]);

  // Real-time subscription
  useEffect(() => {
    if (!userId) return;

    const subscription = NotificationService.subscribeToNotifications(userId, (newNotification) => {
      if (newNotification.is_read) {
        useNotificationStore.getState().markAsRead(newNotification.id);
      } else if (!notifications.some((n) => n.id === newNotification.id)) {
        addNotification(newNotification);
      }
    });

    // Proper cleanup with void return
    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, [userId, notifications, addNotification]);

  const loadNotifications = async () => {
    setRefreshing(true);
    try {
      const data = await NotificationService.initialize(userId);
      useNotificationStore.getState().setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    setRefreshing(false);
  };

  const handleMarkAsRead = async (id: string) => {
    await NotificationService.markAsRead(id);
    useNotificationStore.getState().markAsRead(id);
  };

  const loadAdminResponses = async () => {
    if (!userId) return;

    const responses = await NotificationService.getAdminResponses(userId);
    useNotificationStore.getState().setNotifications(responses);
  };

  return (
    <Container>
      <View className="h-[15%]">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy"></View>
      </View>
      <View className=" mx-4 h-[85%] flex-1">
        <FlatList
          key={`notifications-${updateTrigger}`}
          extraData={notifications.length}
          data={filteredNotifications}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={() => handleMarkAsRead(item.id)} />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="p-4">
              <Text className="text-center text-gray-500">No new notifications</Text>
            </View>
          }
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                loadNotifications();
                setUpdateTrigger((prev) => prev + 1);
              }}
            />
          }
          getItemLayout={(data, index) => ({
            length: 80, // Match your notification item height
            offset: 80 * index,
            index,
          })}
          initialNumToRender={15}
          maxToRenderPerBatch={15}
          windowSize={15}
          removeClippedSubviews={false}
        />
      </View>
    </Container>
  );
}
