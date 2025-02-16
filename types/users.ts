export interface User {
  id: string;
  email?: string;
  user_type?: 'jobseeker' | 'employer';
  // Common fields
  created_at: string;
  updated_at?: string;

  // Employer-specific fields (matches notifications expectations)
  company_name?: string;
  contact_person?: string;
  position_designation?: string;
  contact_number?: string;

  // Jobseeker-specific fields
  first_name?: string;
  last_name?: string;
  profile_picture?: string;
}
