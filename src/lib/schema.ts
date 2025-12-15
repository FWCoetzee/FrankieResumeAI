
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

export const resumeSectionSummarySchema = z.object({
  content: z.string(),
  lastEdited: z.string().datetime(),
});

export const resumeSectionExperienceSchema = z.object({
  id: z.string(),
  company: z.string(),
  role: z.string(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(),
  bullets: z.array(z.string()),
  order: z.number(),
});

export const resumeSectionsSchema = z.object({
  summary: resumeSectionSummarySchema,
  experience: z.array(resumeSectionExperienceSchema),
  education: z.array(z.any()), // Define if needed
  skills: z.array(z.string()),
});

export const resumeSettingsSchema = z.object({
  fontSize: z.number().default(10),
  spacing: z.enum(["normal", "compact"]).default("normal"),
});

// This schema represents the full data structure stored in Firestore for a single resume.
export const resumeSchema = z.object({
  resumeId: z.string(),
  ownerId: z.string(),
  title: z.string(),
  templateId: z.string(),
  status: resumeStatusSchema.default("draft"),
  sections: resumeSectionsSchema,
  settings: resumeSettingsSchema,
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
  isDeleted: z.boolean().default(false),
});
export type ResumeData = z.infer<typeof resumeSchema>;


// This schema represents the data collected from the form.
// It's a subset of the full ResumeData, adapted for form handling.
export const resumeFormSchema = z.object({
  title: z.string().min(1, "Resume title is required"),
  templateId: z.string().default("modern"), // Default template
  sections: z.object({
    summary: z.object({
      content: z.string().optional(),
    }),
    experience: z.array(z.object({
        id: z.string(),
        company: z.string().min(1, "Company is required"),
        role: z.string().min(1, "Role is required"),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        bullets: z.array(z.string()).optional(),
        order: z.number().optional(),
      })
    ),
    education: z.array(z.any()).optional(),
    skills: z.array(z.string()).optional(),
  }),
});
export type ResumeFormData = z.infer<typeof resumeFormSchema>;


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
});
export type GeneratedResumeData = z.infer<typeof generatedResumeSchema>;

// Sticking with the old schema names for compatibility until all flows are updated
export const languageSchema = z.enum(["English", "Afrikaans", "isiNdebele", "isiXhosa", "isiZulu", "Sepedi", "Sesotho", "Setswana", "siSwati", "Tshivenda", "Xitsonga"]);
export const resumeIntentSchema = z.enum(["Professional Corporate", "Creative", "Tech (ATS-Optimized)", "Student / No Experience", "Career Switch"]);
export const experienceLevelSchema = z.enum(["Entry-level", "Mid-level", "Senior", "Lead", "Executive"]);
export const resumeStyleSchema = z.enum(["Modern", "Minimalist", "Creative", "Corporate", "Clean ATS-Friendly"]);
