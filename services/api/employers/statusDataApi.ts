import { supabase } from '~/services/supabase';

// Add a new status for the employer
async function postEmployerStatus(employerId: string) {
  try {
    const { data, error } = await supabase
      .from('employers_status')
      .upsert(
        [
          {
            employer_id: employerId,
            status: 'Pending',
          },
        ],
        { onConflict: 'employer_id' } // Ensure 'employer_id' matches the column in the constraint
      )
      .single();

    if (error) {
      console.error('Error inserting employer status:', error);
    } else {
      console.log('Employer status is inserted successfully:', data);
    }
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// Fetch the status of the employer
async function getEmployerStatus(employerId: string) {
  console.log('Fetching employer id from status: ', employerId);

  // Validate employerId
  if (!employerId || typeof employerId !== 'string') {
    throw new Error('Invalid employer ID');
  }

  try {
    const { data, error } = await supabase
      .from('employers_status')
      .select('*')
      .eq('employer_id', employerId)
      .maybeSingle(); // Use maybeSingle to handle no rows

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      console.log('No status found for employer:', employerId);
      return null;
    }

    console.log('Employer status fetched successfully:', data);
    return data.status;
  } catch (error) {
    console.error('Error in fetchStatus:', error);
    throw error;
  }
}

async function getAppliedJobs() {
  const { data, error } = await supabase.from('applied_job').select('*');

  if (error) {
    console.error('Error fetching applied jobs:', error);
  } else {
    console.log('Applied jobs fetched successfully:', data);
  }
}
export { postEmployerStatus, getEmployerStatus, getAppliedJobs };
