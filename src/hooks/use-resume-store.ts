
import { create } from 'zustand';
import type { ResumeData, GeneratedResumeData, ResumeFormData } from '@/lib/schema';
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { v4 as uuidv4 } from "uuid";

export type GenerationResult = {
  resume?: GeneratedResumeData;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
  error?: string;
  savedResumeId?: string;
};

interface ResumeState {
  currentResume: ResumeData | null;
  result: GenerationResult | null;
  isLoading: boolean;
  isReviewing: boolean;
}

interface ResumeActions {
  setCurrentResume: (resume: ResumeData | null) => void;
  clearCurrentResume: () => void;
  generateAndSetResults: (response: GenerationResult) => void;
  updateResult: (newResult: GenerationResult) => void;
  setFormForReview: (data: ResumeFormData) => void;
  setIsEditing: () => void;
  reset: () => void;
}

const initialState: ResumeState = {
  currentResume: null,
  result: null,
  isLoading: false,
  isReviewing: false,
};

const emptyResume: ResumeData = {
    resumeId: '', 
    ownerId: '',
    title: '',
    templateId: 'modern',
    status: 'draft',
    sections: {
        summary: { content: '', lastEdited: new Date().toISOString() },
        experience: [],
        education: [],
        skills: [],
        projects: [],
        certifications: [],
        references: [],
    },
    settings: { fontSize: 10, spacing: 'normal' },
    isDeleted: false,
};

export const useResumeStore = create<ResumeState & ResumeActions>((set, get) => ({
  ...initialState,
  
  setCurrentResume: (resume) => {
    set({
      currentResume: resume,
      result: null, // Clear previous results when a new resume is loaded
      isReviewing: false,
      isLoading: false,
    });
  },

  clearCurrentResume: () => {
    set({ currentResume: emptyResume, result: null, isReviewing: false, isLoading: false });
  },

  setFormForReview: (data: ResumeFormData) => {
     const existingResume = get().currentResume;
     
     const reviewData: ResumeData = {
        resumeId: existingResume?.resumeId || '',
        ownerId: existingResume?.ownerId || '',
        title: data.title,
        templateId: data.templateId,
        status: 'draft',
        settings: existingResume?.settings || { fontSize: 10, spacing: 'normal' },
        isDeleted: false,
        sections: {
            summary: { content: data.sections.summary?.content || '', lastEdited: new Date().toISOString() },
            experience: (data.sections.experience || []).map((exp, index) => ({
                id: exp.id || uuidv4(),
                role: exp.role,
                company: exp.company,
                // Add guard against invalid date strings
                startDate: exp.startDate ? new Date(exp.startDate).toISOString() : '',
                endDate: exp.endDate && exp.endDate !== 'Present' ? new Date(exp.endDate).toISOString() : null,
                bullets: exp.bullets || [],
                order: index,
            })),
            education: (data.sections.education || []).map((edu, index) => ({
                id: edu.id || uuidv4(),
                degree: edu.degree,
                institution: edu.institution,
                startYear: edu.startYear,
                endYear: edu.endYear,
                order: index,
            })),
            skills: data.sections.skills || [],
            projects: (data.sections.projects || []).map((proj, index) => ({
                id: proj.id || uuidv4(),
                title: proj.title,
                description: proj.description || '',
                order: index,
            })),
            certifications: data.sections.certifications || [],
            references: (data.sections.references || []).map((ref, index) => ({
                id: ref.id || uuidv4(),
                name: ref.name,
                contact: ref.contact,
                order: index,
            })),
        },
    };

    set({ 
      isReviewing: true, 
      currentResume: reviewData,
      result: null 
    });
  },
  
  setIsEditing: () => {
    set({ isReviewing: false, result: null });
  },

  generateAndSetResults: (response) => {
    set((state) => {
      // When generation is successful, update the current resume in the store with the saved ID
      const updatedResume = state.currentResume && response.savedResumeId
        ? { ...state.currentResume, resumeId: response.savedResumeId }
        : state.currentResume;

      return {
        result: response,
        currentResume: updatedResume,
        isLoading: false,
        isReviewing: false,
      };
    });
  },

  updateResult: (newResult) => {
    set({ result: newResult });
  },

  reset: () => {
    set(initialState);
  }
}));
