import { z } from "zod";

export const experienceSchema = z.object({
  title: z.string().min(1, "Title is required"),
  company: z.string().min(1, "Company is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
});

export const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required"),
  degree: z.string().min(1, "Degree is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().optional(),
});

export const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  description: z.string().min(1, "Description is required"),
});

export const additionalSectionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
});

export const resumeSchema = z.object({
  name: z.string().min(1, "Full name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal('')),
  github: z.string().url("Invalid URL").optional().or(z.literal('')),
  jobDescription: z.string().optional(),
  skills: z.array(z.object({ value: z.string().min(1, "Skill cannot be empty") })).min(1, "At least one skill is required"),
  experience: z.array(experienceSchema),
  education: z.array(educationSchema),
  projects: z.array(projectSchema),
  additionalSections: z.array(additionalSectionSchema),
});

export type ResumeData = z.infer<typeof resumeSchema>;
