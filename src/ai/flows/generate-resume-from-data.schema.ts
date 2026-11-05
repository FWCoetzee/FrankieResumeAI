import { z } from 'zod';
import { experienceLevelSchema, resumeIntentSchema, resumeStyleSchema, languageSchema } from '@/lib/schema';

// The input remains the same raw data from the form.
export const GenerateResumeFromDataInputSchema = z.object({
  target_job_title: z.string().min(1).max(200),
  resume_intent: resumeIntentSchema,
  experience_level: experienceLevelSchema,
  resume_style: resumeStyleSchema,
  language: languageSchema,
  personal_info: z.object({
    full_name: z.string().max(200),
    email: z.string().max(320),
    phone: z.string().max(50),
    location: z.string().max(300).optional(),
    website: z.string().max(500).optional(),
    summary: z.string().max(5000).optional(),
  }),
  work_experience: z.array(
    z.object({
      job_title: z.string().max(200),
      company: z.string().max(200),
      start_date: z.string().max(50).optional(),
      end_date: z.string().max(50).optional(),
      responsibilities: z.string().max(5000).optional(),
      achievements: z.string().max(5000).optional(),
    })
  ).max(30),
  education: z.array(
    z.object({
      degree: z.string().max(200),
      institution: z.string().max(200),
      start_year: z.string().max(50).optional(),
      end_year: z.string().max(50).optional(),
    })
  ).max(30),
  skills: z.array(z.string().max(200)).max(100),
  projects: z.array(
    z.object({
      title: z.string().max(200),
      description: z.string().max(5000).optional(),
      technologies: z.array(z.string().max(200)).max(50),
    })
  ).max(30),
  certifications: z.array(z.string().max(300)).max(50),
  references: z.array(z.object({
    name: z.string().max(200),
    contact: z.string().max(320),
  })).max(50),
});

