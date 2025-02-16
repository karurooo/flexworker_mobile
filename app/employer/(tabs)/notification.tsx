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

  const filteredNotifications = notifications.filter(
    (n) =>
      ['new_application', 'job_application'].includes(n.type) && // Update filter
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
      addNotification(newNotification);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [userId, addNotification]);

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

  return (
    <Container>
      <View className="h-[15%]">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy">
          <Search
            onSearch={setSearchTerm}
            placeholder="Search notifications..."
            containerStyle={{
              flex: 1,
              backgroundColor: 'transparent',
              marginHorizontal: 16,
            }}
          />
        </View>
      </View>
      <View className=" mx-4 h-[85%] flex-1">
        <FlatList
          key={`notifications-${notifications.length}`}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={loadNotifications} />}
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
