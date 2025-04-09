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
import { supabase } from '~/services/supabase';
import { setSession } from '~/services/supabase/session';
import { userDataApi } from '~/services/api/users/userDataApi';

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

  // Updated auth listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        console.log('User signed in:', session.user?.id);
        await setSession('session', {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          user: { id: session.user.id },
        });
      } else if (event === 'SIGNED_OUT') {
        console.log('User signed out');
        useUserStore.getState().clearAuth();
      }
    });

    return () => authListener?.subscription.unsubscribe();
  }, []);

  // Update the navigation effect
  useEffect(() => {
    const checkAuthAndNavigate = async () => {
      if (isReady && isAuthenticated) {
        // Fetch complete user data including role
        const userData = await userDataApi();

        if (userData?.role) {
          useUserStore.setState({ role: userData.role });
          const route =
            userData.role === 'employer' ? '/employer/(tabs)/home' : '/jobseeker/(tabs)/home';
          router.replace(route);
        } else {
          console.log('No role found - redirecting to profile setup');
          router.replace('/auth/signup');
        }
      }
    };

    checkAuthAndNavigate().catch(() => {
      useUserStore.getState().clearAuth();
      router.replace('/auth/signin');
    });
  }, [isReady, isAuthenticated, router]);

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
