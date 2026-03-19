
import { z } from "zod";

// ####################################
// # Base Enums
// ####################################

export const planSchema = z.enum(["free", "pro", "premium"]);
export const resumeStatusSchema = z.enum(["draft", "completed"]);
export const themeSchema = z.enum(["hud", "light", "dark"]);

// ####################################
// # User-related Schemas
// ####################################

export const userPreferencesSchema = z.object({
  theme: themeSchema.default("hud"),
  language: z.string().default("en"),
  notifications: z.boolean().default(true),
});

export const userProfileSchema = z.object({
  userId: z.string(),
  email: z.string().email(),
  displayName: z.string(),
  photoURL: z.string().url().nullable(),
  plan: planSchema.default("free"),
  onboardingStep: z.number().default(0),
  preferences: userPreferencesSchema,
  createdAt: z.string().datetime().optional(), // Timestamps will be handled by Firestore
  updatedAt: z.string().datetime().optional(),
});
export type UserProfile = z.infer<typeof userProfileSchema>;

// ####################################
// # Resume-related Schemas
// ####################################

// Base schemas for individual sections, used in both Firestore data and form data
export const resumeSectionSummarySchema = z.object({
  content: z.string().optional(),
  lastEdited: z.any().optional(), // Allow string or server timestamp
});

export const resumeSectionExperienceSchema = z.object({
  id: z.string().optional(),
  company: z.string().min(1, "Company is required"),
  role: z.string().min(1, "Role is required"),
  startDate: z.string().optional(), // Stored as string 'YYYY-MM-DD' in form
  endDate: z.string().optional(), // Stored as string 'YYYY-MM-DD' or 'Present' in form
  bullets: z.array(z.string()).optional(),
  order: z.number().optional(),
});

export const resumeSectionEducationSchema = z.object({
    id: z.string().optional(),
    degree: z.string().min(1, "Degree is required"),
    institution: z.string().min(1, "Institution is required"),
    startYear: z.string().optional(),
    endYear: z.string().optional(),
    order: z.number().optional(),
});

export const resumeSectionProjectSchema = z.object({
    id: z.string().optional(),
    title: z.string().min(1, "Project title is required"),
    description: z.string().optional(),
    order: z.number().optional(),
});

export const resumeSectionReferenceSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Reference name is required"),
    contact: z.string().min(1, "Contact info is required"),
    order: z.number().optional(),
});

// This represents the structure of the data collected from the form.
export const resumeFormSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  templateId: z.string().default("modern"),
  phone: z.string().optional(),
  location: z.string().optional(),
  jobDescription: z.string().optional(),
  sections: z.object({
    summary: resumeSectionSummarySchema.pick({ content: true }).optional(),
    experience: z.array(resumeSectionExperienceSchema).optional(),
    education: z.array(resumeSectionEducationSchema).optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(resumeSectionProjectSchema).optional(),
    certifications: z.array(z.string()).optional(),
    references: z.array(resumeSectionReferenceSchema).optional(),
  }),
});
export type ResumeFormData = z.infer<typeof resumeFormSchema>;

// This schema represents the full data structure stored in SQL.
export const resumeSchema = z.object({
  resumeId: z.number().int(),
  ownerId: z.number().int(),
  title: z.string(),
  templateId: z.string(),
  status: z.string(),
  phone: z.string().optional(),
  location: z.string().optional(),
  jobDescription: z.string().optional(),
  sections: z.object({
    summary: resumeSectionSummarySchema.optional(),
    experience: z.array(resumeSectionExperienceSchema).optional(),
    education: z.array(resumeSectionEducationSchema).optional(),
    skills: z.array(z.string()).optional(),
    projects: z.array(resumeSectionProjectSchema).optional(),
    certifications: z.array(z.string()).optional(),
    references: z.array(resumeSectionReferenceSchema).optional(),
  }),
  settings: z.object({
    fontSize: z.number().default(10),
    spacing: z.enum(["normal", "compact"]).default("normal"),
  }).optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
  isDeleted: z.boolean().default(false).optional(),
});
export type ResumeData = z.infer<typeof resumeSchema>;


// ####################################
// # AI-Generated Data Schemas
// ####################################

export const generatedResumeSchema = z.object({
  headings: z.object({
    summary: z.string(),
    skills: z.string(),
    experience: z.string(),
    education: z.string(),
    projects: z.string(),
    certifications: z.string(),
    references: z.string(),
  }),
  header: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    location: z.string(),
    website: z.string().optional(),
  }),
  summary: z.string(),
  skills: z.array(z.string()),
  experience: z.array(z.object({
    title: z.string(),
    company: z.string(),
    dates: z.string(),
    bulletPoints: z.array(z.string()),
  })),
  education: z.array(z.object({
    degree: z.string(),
    institution: z.string(),
    year: z.string(),
  })),
  projects: z.array(z.object({
    title: z.string(),
    description: z.string(),
  })).optional(),
  certifications: z.array(z.string()).optional(),
  references: z.array(z.object({
    name: z.string(),
    contact: z.string(),
  })).optional(),
});
export type GeneratedResumeData = z.infer<typeof generatedResumeSchema>;

// Sticking with the old schema names for compatibility until all flows are updated
export const languageSchema = z.enum(["English", "Afrikaans", "isiNdebele", "isiXhosa", "isiZulu", "Sepedi", "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga"]);
export const resumeIntentSchema = z.enum(["Professional Corporate", "Creative", "Tech (ATS-Optimized)", "Student / No Experience", "Career Switch"]);
export const experienceLevelSchema = z.enum(["Entry-level", "Mid-level", "Senior", "Lead", "Executive"]);
export const resumeStyleSchema = z.enum(["Modern", "Minimalist", "Creative", "Corporate", "Clean ATS-Friendly"]);
