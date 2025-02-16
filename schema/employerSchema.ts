import { z } from 'zod';
// Base Employer Schema
export const employerSchema = z.object({
  id: z.string().optional(),
  category: z.string().min(1, 'Employer category is required'),
  companyName: z.string().min(1, 'Company name is required'),
  position: z.string().min(1, 'Position is required'),
  contactPerson: z.string().min(1, 'Contact person is required'),
  contactNumber: z
    .string()
    .min(11, 'Contact number must be at least 11 digits')
    .max(11, 'Contact number must be at most 11 digits')
    .refine((value) => value.startsWith('09'), {
      message: 'Contact number must start with 09',
    }),

  email: z.string().email('Invalid email address'),

  status: z.string().optional(),
  address: z.object({
    region: z.string().min(1, 'Region is required'),
    province: z.string().min(1, 'Province is required'),
    city: z.string().min(1, 'City/Municipality is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    street: z.string().min(1, 'Street is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
  }),
  imageTin: z
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

export const corporationSchema = z.object({
  corporateLocation: z.object({
    region: z.string().min(1, 'Region is required'),
    province: z.string().min(1, 'Province is required'),
    city: z.string().min(1, 'City/Municipality is required'),
    barangay: z.string().min(1, 'Barangay is required'),
    street: z.string().min(1, 'Street is required'),
    zipCode: z.string().min(1, 'Zip Code is required'),
  }),

  businessPermit: z
    .string()
    .min(1, 'Business Permit is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  businessPermitSelfie: z
    .string()
    .min(1, 'Business Permit is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  birCert: z
    .string()
    .min(1, 'BIR Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  birCertSelfie: z
    .string()
    .min(1, 'Selfie with BIR Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  secCert: z
    .string()
    .min(1, 'SEC Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  secCertSelfie: z
    .string()
    .min(1, 'Selfie with SEC Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  artInc: z
    .string()
    .min(1, 'Articles of Incorporation Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-documents/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
});
export const governmentEmployerSchema = z.object({
  agencyName: z.string().min(1, 'Agency name is required'),
  department: z.string().min(1, 'Department is required'),
  philGeps: z
    .string()
    .min(1, 'Required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  philGepsSelfie: z
    .string()
    .min(1, 'Required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  accreditation: z
    .string()
    .min(1, 'Government Accreditation is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-documents/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
});
export const soleProprietorshipSchema = z.object({
  dtiCert: z
    .string()
    .min(1, 'DTI Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  dtiCertSelfie: z
    .string()
    .min(1, 'DTI Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  businessPermit: z
    .string()
    .min(1, 'Business Permit is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  businessPermitSelfie: z
    .string()
    .min(1, 'Business Permit is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  birCert: z
    .string()
    .min(1, 'BIR Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),
  birCertSelfie: z
    .string()
    .min(1, 'BIR Certificate is required')
    .refine(
      (value) =>
        value.startsWith(
          'https://jpbsrasldjdqavbzozyp.supabase.co/storage/v1/object/public/user-images/'
        ),
      {
        message: 'Please upload a valid image file (JPEG, PNG, or WebP).',
      }
    ),

  type: z.string().min(1, 'Type is required'),
});
export const JobPostingSchema = z
  .object({
    title: z.string().min(1, 'Job title is required'),
    jobIndustry: z.string().min(1, 'Job industry is required'),
    jobSpecialization: z.string().min(1, 'Job specialization is required'),
    jobType: z.string().min(1, 'Job type is required'),
    description: z.string().min(1, 'Job description is required'),
    salaryType: z.string().min(1, 'Salary type is required'),
    minSalary: z.coerce.number().min(1, 'Minimum salary required'),
    maxSalary: z.coerce.number().min(1, 'Maximum salary required'),
    experience: z.string().min(1, 'Experience is required'),
    location: z.object({
      region: z.string().min(1, 'Region is required'),
      province: z.string().min(1, 'Province is required'),
      city: z.string().min(1, 'City/Municipality is required'),
      barangay: z.string().min(1, 'Barangay is required'),
      street: z.string().min(1, 'Street is required'),
      zipCode: z.string().min(1, 'Zip Code is required'),
    }),
    contractDuration: z.string().min(1, 'Contract duration is required'),
  })
  .refine((data) => data.minSalary <= data.maxSalary, {
    message: 'Minimum salary must be ≤ maximum salary',
    path: ['maxSalary'],
  });

export type JobPostingFormData = z.infer<typeof JobPostingSchema>;
export type SoleProprietorshipDocumentData = z.infer<typeof soleProprietorshipSchema>;
export type GovernmentDocumentData = z.infer<typeof governmentEmployerSchema>;
export type CorporationDocumentData = z.infer<typeof corporationSchema>;
export type EmployerFormData = z.infer<typeof employerSchema>;
