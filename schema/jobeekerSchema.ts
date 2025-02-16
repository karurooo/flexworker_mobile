import { z } from 'zod';

// Base Job Seeker Personal Information Schema
export const PersonalInformationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  middleName: z.string().optional(),
  lastName: z.string().min(1, 'Last name is required'),
  sex: z.string().min(1, 'Sex is required'),
  religion: z.string().min(1, 'Religion is required'),
  contactNumber: z.string().min(11, 'Invalid contact number'),
  civilStatus: z.string().min(1, 'Civil status is required'),
  civilService: z.string().optional(),
  tin: z
    .string()
    .min(1, 'TIN image is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  selfieTin: z
    .string()
    .min(1, 'Selfie Image with TIN ID is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
});
// Base Job Seeker Job Preference Schema
export const JobPrefreferenceSchema = z.object({
  jobIndustry: z.string(),
  jobSpecialization: z.string(),
  workType: z.string(),
  salaryType: z.string(),
  minSalary: z.string().min(1, 'Minimum salary must be greater than 0'),
  maxSalary: z.string().min(1, 'Maximum salary must be greater than 0'),
  planToWork: z.string(),
  location: z.string(),
});

// Base Job Seeker Educational Background Schema
export const EducationalBackgroundSchema = z.object({
  elementary: z.string().min(1, 'Elementary school is required'),
  highschool: z.string().min(1, 'High school is required'),
  bachelor: z.string().min(1, "Bachelor's degree is required"),
  techvoc: z.string().min(1, 'Tech-Voc course is required'),
});

// Base Job Seeker Cover Letter Schema
export const CoverLetterSchema = z.object({
  coverLetter: z.string().min(1, 'Cover letter is required'),
});

// Base Job Seeker Present Address Schema
export const presentAddressSchema = z.object({
  region: z.string().min(1, 'Region is required'),
  province: z.string().min(1, 'Province is required'),
  city: z.string().min(1, 'City is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  street: z.string().min(1, 'Street is required'),
  zipCode: z.string().min(1, 'Zip code is required'),
});

export type PresentAddressFormData = z.infer<typeof presentAddressSchema>;
export type CoverLetterFormData = z.infer<typeof CoverLetterSchema>;
export type EducationalBackgroundFormData = z.infer<typeof EducationalBackgroundSchema>;
export type JobPreferenceFormData = z.infer<typeof JobPrefreferenceSchema>;
export type PersonalInformationFormData = z.infer<typeof PersonalInformationSchema>;
