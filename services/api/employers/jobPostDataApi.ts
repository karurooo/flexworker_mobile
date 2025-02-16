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

export { postJob, getPostByEmployer, getAllJobPosts };
