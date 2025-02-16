import { supabase } from '~/services/supabase';
import { JobPost, JobIndustries, SalaryType } from '~/types/employers';

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
  employers: { company_name: string };
}

interface MatchedJobsResult {
  data: JobPost[] | null;
  error: Error | null;
}

async function getMatchedJobs(userId: string): Promise<JobPost[]> {
  try {
    // Validate input
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }

    // Add cache-busting parameter
    const { data: jobSeeker } = await supabase
      .from('job_seeker')
      .select('job_preference')
      .eq('id', userId)
      .single();

    if (!jobSeeker?.job_preference?.job_industry) {
      throw new Error('Job industry preference not found');
    }

    // Optimized query with required fields
    const { data: jobPostings } = await supabase
      .from('job_postings')
      .select('*')
      .eq('job_industry', jobSeeker.job_preference.job_industry)
      .range(0, 50)
      .order('created_at', { ascending: false });

    if (!jobPostings) throw new Error('No job postings found');

    // Transform with proper typing and null checks
    const transformedData = jobPostings
      ?.map((post) => ({
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
      }))
      .filter((post) => post.id); // Filter out invalid entries

    return transformedData || []; // Direct array return
  } catch (error) {
    console.error('Error fetching matched jobs:', error);
    return []; // Return empty array instead of null
  }
}

export { getMatchedJobs };
