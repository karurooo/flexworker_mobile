import {
  CoverLetterFormData,
  EducationalBackgroundFormData,
  JobPreferenceFormData,
  PersonalInformationFormData,
  PresentAddressFormData,
  JobSkillsFormData,
} from '~/schema/jobeekerSchema';
import { supabase } from '~/services/supabase';

async function postJobseekerPersonalInfo(jobSeeker: PersonalInformationFormData, userId: string) {
  try {
    // Create atomic update operation using transaction-like pattern
    const updatePayload = {
      id: userId,
      personal_information: {
        first_name: jobSeeker.firstName,
        middle_name: jobSeeker.middleName,
        last_name: jobSeeker.lastName,
        sex: jobSeeker.sex,
        religion: jobSeeker.religion,
        contact_number: jobSeeker.contactNumber,
        civil_status: jobSeeker.civilStatus,
        civil_service: jobSeeker.civilService,
        tin: jobSeeker.tin,
      },
    };

    // 1. Update job_seeker table
    const { data: seekerData, error: seekerError } = await supabase
      .from('job_seeker')
      .upsert(updatePayload)
      .eq('id', userId)
      .select('id,  personal_information')
      .single();

    if (seekerError) throw new Error(`Job seeker update failed: ${seekerError.message}`);

    // 2. Update users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert({
        first_name: jobSeeker.firstName,
        last_name: jobSeeker.lastName,
      })
      .eq('id', userId)
      .select('id, first_name, last_name')
      .single();

    if (userError) throw new Error(`User update failed: ${userError.message}`);

    return {
      jobSeeker: {
        ...seekerData,
        present_address: null, // Initialize other fields
        educational_background: null,
        job_preference: null,
        cover_letter: null,
      },
      user: userData,
    };
  } catch (error) {
    console.error(`[${new Date().toISOString()}] API Error:`, error);
    throw new Error(
      error instanceof Error
        ? `Failed to update personal information: ${error.message}`
        : 'An unexpected error occurred'
    );
  }
}

async function postEducationalBackground(jobSeeker: EducationalBackgroundFormData, userId: string) {
  try {
    console.log('Submitting educational background:', jobSeeker);

    const educationalBackgroundJson = {
      elementary: jobSeeker.elementary,
      highschool: jobSeeker.highschool,
      bachelor: jobSeeker.bachelor,
      techvoc: jobSeeker.techvoc,
    };

    const { data, error } = await supabase
      .from('job_seeker')
      .upsert({
        id: userId,
        educational_background: educationalBackgroundJson,
      })
      .select('educational_background')
      .single();

    if (error) {
      console.error('[EducationalBackground] Supabase error:', error);
      throw new Error(`Educational background update failed: ${error.message}`);
    }

    console.log('Educational background updated successfully:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Educational Background Error:`, error);
    throw new Error();
  }
}
async function postCoverLetter(jobSeeker: CoverLetterFormData, userId: string) {
  try {
    console.log('Submitting cover letter:', jobSeeker);

    const { data, error } = await supabase
      .from('job_seeker')
      .upsert({
        id: userId,
        cover_letter: jobSeeker.coverLetter,
      })
      .select('cover_letter')
      .single();

    if (error) {
      console.error('[CoverLetter] Supabase error:', error);
      throw new Error(`Cover letter update failed: ${error.message}`);
    }

    console.log('Cover letter updated successfully:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Cover Letter Error:`, error);
    throw new Error(
      error instanceof Error
        ? `Failed to update cover letter: ${error.message}`
        : 'An unexpected error occurred'
    );
  }
}
async function postJobPreference(jobSeeker: JobPreferenceFormData, userId: string) {
  try {
    console.log('Submitting job preference:', jobSeeker);

    const { data, error } = await supabase
      .from('job_seeker')
      .upsert({
        id: userId,
        job_preference: {
          work_type: jobSeeker.workType,
          salary_type: jobSeeker.salaryType,
          min_salary: jobSeeker.minSalary,
          max_salary: jobSeeker.maxSalary,
          plan_to_work: jobSeeker.planToWork,
          location: jobSeeker.location,
        },
      })
      .select('job_preference')
      .single();

    if (error) {
      console.error('[JobPreference] Supabase error:', error);
      throw new Error(`Job preference update failed: ${error.message}`);
    }

    console.log('Job preference updated successfully:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Job Preference Error:`, error);
    throw new Error(
      error instanceof Error
        ? `Failed to update job preference: ${error.message}`
        : 'An unexpected error occurred'
    );
  }
}
async function postPresentAddress(jobSeeker: PresentAddressFormData, userId: string) {
  try {
    console.log('Submitting present address:', jobSeeker);

    const { data, error } = await supabase
      .from('job_seeker')
      .upsert({
        id: userId,
        present_address: {
          region: jobSeeker.region,
          province: jobSeeker.province,
          city: jobSeeker.city,
          barangay: jobSeeker.barangay,
          street: jobSeeker.street,
          zip_code: jobSeeker.zipCode, // Match database snake_case
        },
      })
      .select('present_address')
      .single();

    if (error) {
      console.error('[PresentAddress] Supabase error:', error);
      throw new Error(`Present address update failed: ${error.message}`);
    }

    console.log('Present address updated successfully:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Present Address Error:`, error);
    throw new Error(
      error instanceof Error
        ? `Failed to update present address: ${error.message}`
        : 'An unexpected error occurred'
    );
  }
}

async function postJobSkills(jobSeeker: JobSkillsFormData, userId: string) {
  try {
    console.log('Submitting job skills:', jobSeeker);

    const { data, error } = await supabase
      .from('job_seeker_skills')
      .insert({
        user_id: userId,
        industry: jobSeeker.jobIndustry,
        specialization: jobSeeker.jobSpecialization,
      })
      .single();

    if (error) {
      console.error('[JobSkills] Supabase error:', error);
      throw new Error(`Job skills update failed: ${error.message}`);
    }

    console.log('Job skills inserted successfully:', data);
  } catch (error) {
    console.error(`[${new Date().toISOString()}] Job Skills Error:`, error);
    throw new Error(
      error instanceof Error
        ? `Failed to insert job skills: ${error.message}`
        : 'An unexpected error occurred'
    );
  }
}

async function getJobseekerData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('job_seeker')
      .select('*')
      .eq('id', userId) // Match your DB column name
      .maybeSingle();

    if (error) throw error;
    console.log('Jobseeker data:', data);
    return data;
  } catch (error) {
    console.error('Jobseeker data fetch failed:', error);
    throw error;
  }
}

async function getJobSeekerSkillsData(userId: string) {
  try {
    const { data, error } = await supabase
      .from('job_seeker_skills')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    console.log('Jobseeker Skills:', data);
    return data;
  } catch (error) {
    console.error('Jobseeker Skill data fetch failed', error);
    throw error;
  }
}

async function deleteJobSeekerSkillsData(id: string) {
  try {
    const { data, error } = await supabase.from('job_seeker_skills').delete().eq('id', id);

    if (error) throw error;
    console.log('Jobseeker Skills:', data);
    return data;
  } catch (error) {
    console.error('Jobseeker Skill data fetch failed', error);
    throw error;
  }
}

export {
  getJobseekerData,
  postJobseekerPersonalInfo,
  postEducationalBackground,
  postCoverLetter,
  postJobPreference,
  postPresentAddress,
  postJobSkills,
  getJobSeekerSkillsData,
  deleteJobSeekerSkillsData,
};
