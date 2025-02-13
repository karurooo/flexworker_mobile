import 'react-native-reanimated';
import '~/global.css';
import { useEffect, useState } from 'react';
import { SplashScreen, Slot } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { useUserStore } from '~/store/users';
import { ActivityIndicator, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

export default function RootLayout() {
  const queryClient = new QueryClient();
  const { isAuthenticated, initializeAuth } = useUserStore();
  const [isReady, setIsReady] = useState(false); // Track app readiness
  const router = useRouter();

  // Initialize authentication state when the app starts
  useEffect(() => {
    const init = async () => {
      await initializeAuth();
      setTimeout(() => {
        setIsReady(true); // Mark the app as ready after a delay
      }, 1000); // 1-second delay
    };
    init();
  }, []);

  // Hide the splash screen once the app is ready
  useEffect(() => {
    if (isReady) {
      SplashScreen.hideAsync();
    }
  }, [isReady]);

  // Navigate authenticated users to the home screen
  useEffect(() => {
    if (isReady && isAuthenticated) {
      router.replace('/employer/(tabs)/home');
    }
  }, [isReady, isAuthenticated]);
  {
    !isReady ? (
      <View className="flex-1 items-center justify-center ">
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    ) : null;
  }

  // Render the app structure
  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <Slot />
          <StatusBar style="auto" />
        </QueryClientProvider>
      </GestureHandlerRootView>
    </>
  );
}
