import { supabase } from '~/services/supabase';
import { JobPost, SalaryType } from '~/types/employers';

interface JobPostWithRelations {
  id: string;
  created_at: string;
  employer_id: string;
  job_title: string;
  job_industry: string;
  job_type: string;
  salary_type: SalaryType;
  min_salary: number;
  max_salary: number;
  description?: string;
  experience?: string;
  location?: string;
  contract?: string;
  job_specialization?: string;
  company_name: string; // Derived from employers relation
}

async function getMatchedJobs(userId: string): Promise<JobPostWithRelations[]> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }

    // Fetch all industries associated with the user
    const { data: jobSeekerIndustries, error: industriesError } = await supabase
      .from('job_seeker_skills')
      .select('industry')
      .eq('user_id', userId);

    if (industriesError) {
      throw new Error(`Error fetching job seeker industries: ${industriesError.message}`);
    }

    // Extract industries into an array
    const industries = jobSeekerIndustries?.map((item) => item.industry).filter(Boolean);
    if (!industries || industries.length === 0) {
      throw new Error('No job industries found for the user');
    }

    // Query jobs matching any of the user's industries
    const { data: jobPostings, error: jobPostsError } = await supabase
      .from('job_postings')
      .select(`
        *,
        employers!inner(company_name)
      `)
      .in('job_industry', industries) // Match any of the user's industries
      .range(0, 50) // Limit results
      .order('created_at', { ascending: false }); // Order by most recent

    if (jobPostsError) {
      throw new Error(`Error fetching job postings: ${jobPostsError.message}`);
    }

    if (!jobPostings || jobPostings.length === 0) {
      console.warn('No job postings found for the given industries');
      return [];
    }

    // Transform the data into the desired format
    const transformedData = jobPostings.map((post) => ({
      id: post.id,
      created_at: post.created_at,
      employer_id: post.employer_id,
      job_title: post.job_title,
      job_industry: post.job_industry,
      job_type: post.job_type,
      salary_type: post.salary_type,
      min_salary: post.min_salary ?? 0,
      max_salary: post.max_salary ?? 0,
      description: post.description,
      experience: post.experience,
      location: post.location,
      contract: post.contract,
      job_specialization: post.job_specialization,
      company_name: post.employers?.company_name || 'Unknown Company',
    }));

    return transformedData;
  } catch (error) {
    console.error('Error fetching matched jobs:', error);
    return []; // Return empty array on error
  }
}

export { getMatchedJobs };