import { supabase } from '~/services/supabase';
import * as SecureStore from 'expo-secure-store';
import { useUserStore } from '~/store/users';

export async function userDataApi() {
  try {
    const userId = useUserStore.getState().authID;
    if (!userId) {
      console.log('Failed to fetch user: Auth session missing!');
      return null; // Return null if session is missing
    }

    console.log('Fetching user data for user:', userId);
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching user data:', error.message);
      return null;
    }
    
    const userData = data;
    console.log('User data fetched successfully:', userData);
    return userData;
  } catch (error) {
    console.error('Error in userDataApi:', error);
    return null;
  }
}
