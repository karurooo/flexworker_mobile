import { View, Text, TouchableOpacity } from 'react-native';
import ProfilePicture from '../Shared/ProfilePicture';
import { capitalizeWords } from '~/utils/strings';
import { useUserData } from '~/hooks/query/useUserData';
import { useUserStore } from '~/store/users';
import { AntDesign } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import Alert from '../Shared/Alerts';
import { useState } from 'react';

export default function ProfileHeader() {
  const queryClient = useQueryClient();
  const { data: user, isLoading, isError } = useUserData();
  const { email } = useUserStore();
  const [showLogoutAlert, setShowLogoutAlert] = useState(false);

  const handleConfirmLogout = async () => {
    try {
      // Use the store's signOut method instead of clearAuth
      await useUserStore.getState().signOut();
      queryClient.removeQueries();
      router.replace('/auth/signin');
      setShowLogoutAlert(false);
    } catch (error) {
      console.error('Logout error:', error);
      // Optional: Show error alert to user
    }
  };

  return (
    <View className="h-full flex-row items-center gap-2 rounded-br-[75px] bg-navy px-4">
      <ProfilePicture />
      <View className="h-full   justify-center">
        <Text className="text-white">
          {capitalizeWords(`${user?.first_name} ${user?.last_name}`)}
        </Text>
        <Text className="text-white">{email}</Text>
        <Text className="text-white">{capitalizeWords(user?.role)}</Text>
      </View>
      <View className=" gap-2">
        <TouchableOpacity onPress={() => setShowLogoutAlert(true)}>
          <AntDesign name="logout" size={18} color="white" />
        </TouchableOpacity>
      </View>

      {showLogoutAlert && (
        <Alert
          isVisible={showLogoutAlert}
          title="Logout"
          variant="confirmation"
          message="Are you sure you want to logout?"
          onConfirm={handleConfirmLogout}
        />
      )}
    </View>
  );
}
