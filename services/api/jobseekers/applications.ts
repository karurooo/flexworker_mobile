import { supabase } from '~/services/supabase';
import { Application, ApplicationStatus } from '~/types/applications';
import { JobPost } from '~/types/employers';
import { getJobseekerData, getJobSeekerSkillsData } from './jobseekerDataApi';

export const ApplicationService = {
  applyToJob: async (jobPostingId: string, jobSeekerId: string) => {
    // Add null check for jobSeekerId
    if (!jobSeekerId) {
      return {
        data: null,
        error: { message: 'Invalid user ID' },
      };
    }

    // Use pre-fetched data from react-query cache instead of new query
    console.log('Applying to job:', jobSeekerId);
    const profile = await getJobseekerData(jobSeekerId);
    const jobSeekerSkills = await getJobSeekerSkillsData(jobSeekerId);
    console.log('Cached profile data:', profile);
    if (!profile) {
      return {
        data: null,
        error: { message: 'Complete your job seeker profile before applying' },
      };
    }

    // More robust validation checking nested properties
    const isValidProfile = [
      profile.personal_information?.first_name,
      profile.job_preference?.work_type,
      profile.job_preference?.salary_type,
      profile.job_preference?.location,
      profile.educational_background?.bachelor,
      profile.present_address?.city,
      jobSeekerSkills,
    ].every((field) => !!field);

    console.log('Profile validation:', isValidProfile);
    if (!isValidProfile) {
      return {
        data: null,
        error: { message: 'Complete all required profile sections before applying' },
      };
    }

    // Proceed with application
    const { data, error } = await supabase
      .from('applied_job')
      .insert([
        {
          job_seeker_id: jobSeekerId,
          job_posting_id: jobPostingId,
          status: 'pending',
        },
      ])
      .select()
      .single();

    if (error?.code === '23505') {
      return {
        data: null,
        error: {
          message: 'You have already applied to this position',
        },
      };
    }

    return { data, error };
  },

  getApplicationStatus: async (jobPostingId: string, jobSeekerId: string) => {
    const { data, error } = await supabase
      .from('applied_job')
      .select('status')
      .eq('job_posting_id', jobPostingId)
      .eq('job_seeker_id', jobSeekerId)
      .single();

    return { status: data?.status as ApplicationStatus | null, error };
  },

  getApplications: async (jobSeekerId: string) => {
    const { data, error } = await supabase
      .from('applied_job')
      .select(
        `
        id,
        created_at,
        status,
        job_postings (
          id,
          job_title,
          company_name,
          location,
          salary_range,
          job_type,
          created_at
        )
      `
      )
      .eq('job_seeker_id', jobSeekerId)
      .order('created_at', { ascending: false });

    return { data: data as Array<Application & { job_postings: JobPost }> | null, error };
  },
};
