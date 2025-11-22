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
  technologies: z.array(z.string()),
});

export const resumeIntentSchema = z.enum([
  "Professional Corporate",
  "Creative",
  "Tech (ATS-Optimized)",
  "Student / No Experience",
  "Career Switch",
]);

export const experienceLevelSchema = z.enum([
  "Entry-level",
  "Mid-level",
  "Senior",
  "Lead",
  "Executive",
]);

export const resumeStyleSchema = z.enum([
  "Modern",
  "Minimalist",
  "Corporate",
  "Creative",
  "Clean ATS-Friendly",
]);


// Main resume schema based on Day 2 Blueprint
export const resumeSchema = z.object({
  jobDescription: z.string().optional(),
  target_job_title: z.string().min(1, "Target job title is required"),
  resume_intent: resumeIntentSchema,
  experience_level: experienceLevelSchema,
  resume_style: resumeStyleSchema,
  personal_info: personalInfoSchema,
  work_experience: z.array(workExperienceSchema),
  education: z.array(educationSchema),
  skills: z.array(z.string()),
  projects: z.array(projectSchema),
  certifications: z.array(z.string()),
});

export type ResumeData = z.infer<typeof resumeSchema>;
