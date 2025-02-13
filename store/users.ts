import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';

interface UserState {
  isAuthenticated: boolean;
  userSession: string | null;
  initializeAuth: () => Promise<void>;
  signIn: (sessionToken: string) => void;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  isAuthenticated: false,
  userSession: null,

  // Initialize authentication state on app load
  initializeAuth: async () => {
    try {
      console.log('Initializing auth...');
      const sessionToken = await SecureStore.getItemAsync('session');
      if (sessionToken) {
        const {
          data: { user },
          error,
        } = await supabase.auth.getUser(sessionToken);
        if (!error && user) {
          set({ isAuthenticated: true, userSession: sessionToken });
          console.log('User is authenticated:', user);
        }
      }
    } catch (error) {
      console.error('Failed to initialize auth:', error);
    }
  },

  // Sign in and update the session
  signIn: (sessionToken: string) => {
    set({ isAuthenticated: true, userSession: sessionToken });
    SecureStore.setItemAsync('session', sessionToken); // Persist the session token
  },

  // Sign out and clear the session
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('session'); // Clear the session token
      set({ isAuthenticated: false, userSession: null });
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  },
}));
