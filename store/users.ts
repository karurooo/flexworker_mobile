import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { supabase } from '../services/supabase';
import { getSession } from '~/services/supabase/session';
import { useUserData } from '~/hooks/query/useUserData';
import { User } from '@supabase/supabase-js';
import { recoverSession } from '~/services/api/authApi';

interface UserState {
  user: User | null;
  isAuthenticated: boolean;
  userSession: string | null;
  authID: string | null;
  email: string;
  role: string | null;
  currentUser: User | null;
  initializeAuth: () => Promise<void>;
  signIn: (sessionToken: string) => void;
  signOut: () => Promise<void>;
  setAuthentication: (authID: string, email: string, role: string | null) => void;
  clearAuth: () => void;
  validateSession: () => Promise<boolean>;
  isReady: boolean;
  initialize: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isAuthenticated: false,
  userSession: null,
  authID: null,
  email: '',
  role: null,
  currentUser: null,
  isReady: false,

  initializeAuth: async () => {
    try {
      const session = await recoverSession();
      if (session) {
        set({
          currentUser: session.user,
          authID: session.user.id,
          isAuthenticated: true,
          isReady: true,
          email: session.user.email,
        });
      } else {
        set({ isReady: true });
      }
    } catch (error) {
      let errorMessage = 'Session expired. Please sign in again.';
      if (error instanceof Error && error.message.includes('Invalid Refresh Token')) {
        errorMessage = 'Your session has expired. Please sign in again.';
        await SecureStore.deleteItemAsync('session'); // Clear invalid token
      }

      set({
        isReady: true,
        isAuthenticated: false,
        userSession: null,
        authID: null,
        email: '',
        role: null,
      });

      throw new Error(errorMessage);
    }
  },

  // Sign in and update the session
  signIn: (session: string) => {
    set({ isAuthenticated: true, userSession: session });
  },

  setAuthentication: (authID, email, role) => {
    // Get the actual session token from store state
    const sessionToken = useUserStore.getState().userSession;

    if (sessionToken) {
      SecureStore.setItemAsync('session', sessionToken);
    }

    set({ authID, email, role, isAuthenticated: true });
  },

  clearAuth: () => {
    // Clear both local state and SecureStore
    SecureStore.deleteItemAsync('session');
    set({ isAuthenticated: false, userSession: null, authID: null, email: '', role: null });
  },
  // Sign out and clear the session
  signOut: async () => {
    try {
      await supabase.auth.signOut();
      await SecureStore.deleteItemAsync('session'); // Clear the session token
      set({ isAuthenticated: false, userSession: null, authID: null, email: '', role: null });
    } catch (error) {
      throw error;
    }
  },

  validateSession: async () => {
    const sessionToken = await SecureStore.getItemAsync('session');
    if (!sessionToken) return false;

    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(sessionToken);
    return !!user && !error;
  },

  initialize: async () => {
    await useUserStore.getState().initializeAuth();
  },
}));

// Call initialize once when store is created
useUserStore.getState().initialize();
