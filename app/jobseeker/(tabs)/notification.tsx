import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState, useMemo, useEffect } from 'react';
import { View, Text, FlatList } from 'react-native';
import { Container } from '~/components/Shared/Container';
import { NotificationService } from '~/services/api/notifications';
import { useNotificationStore } from '~/store/notifications';
import NotificationItem from '~/components/Shared/NotificationItem';
import SearchBar from '~/components/Shared/Search';
import { useUserData } from '~/hooks/query/useUserData';

export default function Notification() {
  const { notifications, markAsRead } = useNotificationStore();
  const [searchQuery, setSearchQuery] = useState('');
  const { data: user } = useUserData();
  const userId = user?.id;
  const [refreshing, setRefreshing] = useState(false);
  const addNotification = useNotificationStore((state) => state.addNotification);

  const filteredNotifications = useMemo(
    () =>
      notifications.filter(
        (n) =>
          (n.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.message?.toLowerCase().includes(searchQuery.toLowerCase())) &&
          ['application_update', 'hired', 'rejected'].includes(n.type)
      ),
    [notifications, searchQuery]
  );

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
      const data = await NotificationService.initialize(userId!);
      useNotificationStore.getState().setNotifications(data || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadNotifications();
  }, [userId]);

  return (
    <Container>
      <View className="h-[15%] ">
        <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy ">
          <SearchBar
            onSearch={(query: string) => setSearchQuery(query)}
            placeholder="Search notifications..."
            debounceTime={300}
          />
        </View>
      </View>
      <View className=" mx-4 h-[85%] flex-1">
        <FlatList
          data={filteredNotifications}
          renderItem={({ item }) => (
            <NotificationItem notification={item} onPress={() => markAsRead(item.id)} />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={
            <View className="p-4">
              <Text className="text-center text-gray-500">No notifications found</Text>
            </View>
          }
        />
      </View>
    </Container>
  );
}
