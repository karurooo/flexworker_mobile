export interface Notification {
  id: string;
  type: 'new_application' | 'application_update' | 'job_alert' | 'accepted' | 'rejected';
  title: string;
  senderName?: string; // Add this line to include senderName
  message: string;
  created_at: string;
  is_read: boolean;
  job_posting_id?: string; // Fix typo in job_posting_id
  metadata?: {
    jobId: string;
    decision?: 'accepted' | 'rejected';
    applied_job_id?: string;
    applicantId?: string;
    job_title?: string;
    senderName?: string;

    // Employer details
    employer?: {
      id: string;
      contract: string;
      job_type: string;
      location: Location;
      job_title: string;
      created_at: string;
      experience: string;
      max_salary: number;
      min_salary: number;
      description: string;
      employer_id: string;
      salary_type: string;
      company_name: string;
      job_industry: string;
      job_specialization: string;
    };

    // Applicant profile details
    applicantProfile?: {
      id: string;
      isNewUser: boolean;
      created_at: string;
      cover_letter: string;
      job_preference: JobPreference;
      present_address: Location;
      personal_information: PersonalInformation;
      educational_background: EducationalBackground;
    };

    job_postings?: {
      job_title: string;
      company_name: string;
      location?: Location;
    };
  };
  user_id: string;
  applicant?: any;
}

// Location interface (used in both Employer and ApplicantProfile)
export interface Location {
  city: string;
  region: string;
  street: string;
  zipCode?: string; // Optional because it's not present in all cases
  barangay: string;
  province: string;
}

// Job Preference interface (used in ApplicantProfile)
export interface JobPreference {
  location: string;
  work_type: string;
  max_salary: number;
  min_salary: number;
  salary_type: string;
  job_industry: string;
  plan_to_work: string;
  job_specialization: string;
}

// Personal Information interface (used in ApplicantProfile)
export interface PersonalInformation {
  sex: string;
  tin: string; // Note: This seems to be a URL in the example, but adjust if needed
  religion: string;
  last_name: string;
  first_name: string;
  middle_name: string;
  civil_status: string;
  civil_service: string;
  contact_number: string;
}

// Educational Background interface (used in ApplicantProfile)
export interface EducationalBackground {
  techvoc: string;
  bachelor: string;
  elementary: string;
  highschool: string;
}
