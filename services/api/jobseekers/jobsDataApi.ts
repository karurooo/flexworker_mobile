import { supabase } from '~/services/supabase';
import { JobPostWithRelations } from '~/types/employers';

export const getMatchedJobs = async (userId?: string, selectedIndustry?: string) => {
  if (!userId) return [];

  let query = supabase
    .from('job_postings')
    .select('*, employers:employer_id (company_name, user_id)')
    .order('created_at', { ascending: false });

  // If a specific industry is provided, filter by it
  if (selectedIndustry) {
    query = query.eq('job_industry', selectedIndustry);
  } else {
    // Otherwise, fall back to the user's saved skills/industries
    const { data: skills } = await supabase
      .from('job_seeker_skills')
      .select('industry')
      .eq('user_id', userId);

    const industries = skills?.map((s) => s.industry) || [];
    if (industries.length === 0) return [];

    query = query.in('job_industry', industries);
  }

  const { data: jobPostings, error } = await query.range(0, 50);

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
