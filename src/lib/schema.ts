import { z } from "zod";

// Re-defined based on Day 2 Blueprint
export const personalInfoSchema = z.object({
  full_name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  location: z.string().optional(),
  summary: z.string().optional(),
});

export const workExperienceSchema = z.object({
  job_title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company is required"),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  responsibilities: z.string().optional(),
  achievements: z.string().optional(),
});

export const educationSchema = z.object({
  degree: z.string().min(1, "Degree is required"),
  institution: z.string().min(1, "Institution is required"),
  start_year: z.string().optional(),
  end_year: z.string().optional(),
});

export const projectSchema = z.object({
  title: z.string().min(1, "Project title is required"),
  description: z.string().optional(),
  technologies: z.array(z.object({ value: z.string().min(1, "Technology cannot be empty") })),
});

// Main resume schema based on Day 2 Blueprint
export const resumeSchema = z.object({
  jobDescription: z.string().optional(), // For AI suggestions later
  personal_info: personalInfoSchema,
  work_experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.object({ value: z.string().min(1, "Skill cannot be empty") })).min(1, "At least one skill is required"),
  projects: z.array(projectSchema),
  certifications: z.array(z.object({ value: z.string().min(1, "Certification cannot be empty") })),
});

export type ResumeData = z.infer<typeof resumeSchema>;
