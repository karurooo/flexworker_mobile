import { supabase } from '~/services/supabase';
import { JobPostWithRelations, SalaryType } from '~/types/employers';

export const getMatchedJobs = async (userId?: string) => {
  if (!userId) return [];

  const { data: jobSeeker } = await supabase
    .from('job_seeker')
    .select('job_preference')
    .eq('id', userId)
    .single();

  if (!jobSeeker?.job_preference?.job_industry) return [];

  const { data: jobPostings, error } = await supabase
    .from('job_postings')
    .select('*, employers:employer_id (company_name, user_id)')
    .eq('job_industry', jobSeeker.job_preference.job_industry)
    .range(0, 50)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching matched jobs:', error);
    return [];
  }

  return jobPostings.map((post) => ({
    ...post,
    employer_user_id: post.employers?.user_id || '',
    employers: {
      company_name: post.employers?.company_name || 'Unknown Company',
      user_id: post.employers?.user_id || '',
    },
  })) as JobPostWithRelations[];
};
