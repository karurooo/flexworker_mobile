// schema/auth.ts
import { z } from 'zod';

export const signupSchema = z
  .object({
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters'),
    confirm_password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(16, 'Password must be at most 16 characters'),
    first_name: z.string().min(1, 'First name is required'),
    last_name: z.string().min(1, 'Last name is required'),
    agree_to_terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the terms and conditions.',
    }),
    role: z.enum(['employer', 'jobSeeker'], {
      message: 'Select a valid role',
    }),
  })

  .superRefine(({ confirm_password, password }, ctx) => {
    if (confirm_password !== password) {
      ctx.addIssue({
        code: 'custom',
        message: 'The passwords did not match',
        path: ['confirm_password'],
      });
    }
  });

export const signinSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const verificationSchema = z.object({
  otp: z
    .string()
    .min(6, 'OTP must be 6 digits')
    .max(6, 'OTP must be 6 digits')
    .refine((val) => /^\d+$/.test(val), 'OTP must contain only numbers'),
});
// Type inference
export type SignupFormData = z.infer<typeof signupSchema>;
export type SigninFormData = z.infer<typeof signinSchema>;
export type VerificationFormData = z.infer<typeof verificationSchema>;
