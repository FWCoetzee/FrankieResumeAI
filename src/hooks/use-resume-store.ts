
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
  generateAndSetResults: (response: GenerationResult, formData: ResumeFormData) => void;
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

export const useResumeStore = create<ResumeState & ResumeActions>((set, get) => ({
  ...initialState,
  
  setCurrentResume: (resume) => {
    set({
      currentResume: resume,
      result: null,
      isReviewing: false,
      isLoading: false,
    });
  },

  clearCurrentResume: () => {
    set({ currentResume: null, result: null, isReviewing: false, isLoading: false });
  },

  setFormForReview: (data) => {
     const reviewData: Partial<ResumeData> = {
        title: data.title,
        templateId: data.templateId,
        sections: {
            summary: { content: data.sections.summary?.content || '', lastEdited: new Date().toISOString() },
            experience: (data.sections.experience || []).map(exp => ({ ...exp, id: exp.id || uuidv4(), startDate: new Date(exp.startDate || '').toISOString(), endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null, bullets: exp.bullets || [], order: 0 })),
            education: [],
            skills: data.sections.skills || [],
        }
    };
    set({ 
      isReviewing: true, 
      currentResume: { ...get().currentResume, ...reviewData } as ResumeData,
      result: null 
    });
  },
  
  setIsEditing: () => {
    set({ isReviewing: false, result: null });
  },

  generateAndSetResults: (response, formData) => {
    set({ isLoading: true });
    if (response.savedResumeId && get().currentResume) {
        set({ currentResume: { ...get().currentResume!, resumeId: response.savedResumeId } });
    }
    set({ result: response, isLoading: false, isReviewing: false });
  },

  updateResult: (newResult) => {
    set({ result: newResult });
  },

  reset: () => {
    set(initialState);
  }
}));
