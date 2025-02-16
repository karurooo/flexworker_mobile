import { supabase } from '~/services/supabase';

async function getAnnouncement(userId: string) {
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId provided');
  }

  console.log('Fetching employer data for user:', userId);
  try {
    const { data, error } = await supabase.from('announcements').select('*');

    if (error && !data) {
      console.error('Something went wrong in fetch employer: ', error);
      throw new Error(error.message);
    }
    return data;
  } catch (error) {
    console.log('Error in fetchEmployerData:', error);
    throw error;
  }
}
export { getAnnouncement };
