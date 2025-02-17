import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '~/services/supabase';
import { JobPostingFormData } from '~/schema/employerSchema';
import { useEmployerData } from '~/hooks/query/useEmployerData';
import { JobPost } from '~/types/employers';

async function postJob(employerId: string, userId: string, job: JobPostingFormData) {
  const { data, error } = await supabase
    .from('job_postings')
    .insert({
      employer_id: employerId,
      employer_user_id: userId,
      job_title: job.title,
      job_industry: job.jobIndustry,
      job_specialization: job.jobSpecialization,
      job_type: job.jobType,
      description: job.description,
      min_salary: job.minSalary,
      max_salary: job.maxSalary,
      salary_type: job.salaryType,
      experience: job.experience,
      location: job.location,
      contract: job.contractDuration,
    })
    .select('*');

  if (error) {
    console.log('Supabase error:', error); // Debugging
    throw new Error(error.message);
  }

  console.log('Job posted successfully:', data); // Debugging
  return data;
}

// Fetch all job postings in the database
async function getAllJobPosts(page: number, pageSize: number): Promise<JobPost[]> {
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .order('created_at', { ascending: false })
    .range(start, end);

  if (error) throw error;
  return data as JobPost[];
}

async function getPostByEmployer(employerId: string): Promise<JobPost[]> {
  const { data, error } = await supabase
    .from('job_postings')
    .select('*')
    .eq('employer_id', employerId)
    .order('created_at', { ascending: false });

  console.log('API Response - getPostByEmployer:', { data, error });
  if (error) throw error;
  return data as JobPost[];
}

//create an api function for total number of employers job posts

//create an api function for total number of applicants who applied to the job post

//create an api function for total number of applicants who are accepted by the employer

async function getTotalJobPosts(employerId: string): Promise<number> {
  const { count, error } = await supabase
    .from('job_postings')
    .select('*', { count: 'exact', head: true })
    .eq('employer_id', employerId);

  if (error) {
    console.error('Error fetching total job posts:', error);
    throw error;
  }

  return count || 0;
}
async function getTotalApplicants(employerId: string): Promise<number> {
  // Step 1: Fetch job posting IDs for the employer
  const { data: jobPostings, error: jobError } = await supabase
    .from('job_postings')
    .select('id')
    .eq('employer_id', employerId);

  if (jobError) {
    console.error('Error fetching job postings for employer:', jobError);
    throw jobError;
  }

  // Extract job IDs
  const jobIds = jobPostings?.map((post) => post.id) ?? [];

  if (jobIds.length === 0) {
    return 0; // No job posts mean no applicants
  }

  // Step 2: Count applicants who applied to those job postings
  const { count, error } = await supabase
    .from('applied_job')
    .select('*', { count: 'exact', head: true })
    .in('job_posting_id', jobIds);

  if (error) {
    console.error('Error fetching total applicants by employer:', error);
    throw error;
  }

  return count ?? 0;
}

async function getAcceptedApplicants(employerId: string): Promise<number> {
  const { data: jobPosts, error: jobPostsError } = await supabase
    .from('job_postings')
    .select('id')
    .eq('employer_id', employerId);

  if (jobPostsError) {
    console.error('Error fetching employer job postings:', jobPostsError);
    throw jobPostsError;
  }

  const jobIds = jobPosts.map((job) => job.id);

  if (jobIds.length === 0) {
    return 0; // If employer has no job postings, return 0
  }

  const { count, error } = await supabase
    .from('applied_job')
    .select('*', { count: 'exact', head: true })
    .in('job_posting_id', jobIds)
    .eq('status', 'Approved');

  if (error) {
    console.error('Error fetching accepted applicants by employer:', error);
    throw error;
  }

  return count ?? 0;
}

export {
  postJob,
  getPostByEmployer,
  getAllJobPosts,
  getTotalJobPosts,
  getTotalApplicants,
  getAcceptedApplicants,
};
