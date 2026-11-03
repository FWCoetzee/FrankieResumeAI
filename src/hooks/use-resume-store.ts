import { create } from 'zustand';
import type { ResumeData, GeneratedResumeData, ResumeFormData } from '@/lib/schema';
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import type { TailoringAnalysis } from '@/ai/flows/analyze-tailoring';
import { buildReviewResumeData } from '@/lib/resume-form-helpers';

export type GenerationResult = {
  resume?: GeneratedResumeData;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
  tailoring?: TailoringAnalysis;
  error?: string;
  savedResumeId?: number;
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
  setGenerationResult: (response: GenerationResult) => void;
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

const emptyResume: Partial<ResumeData> = {
    title: '',
    templateId: 'modern',
    status: 'DRAFT',
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
      result: null,
      isReviewing: false,
      isLoading: false,
    });
  },

  clearCurrentResume: () => {
    set({ currentResume: null, result: null, isReviewing: false, isLoading: false });
  },

  setFormForReview: (data: ResumeFormData) => {
     const existingResume = get().currentResume;
     const reviewData = buildReviewResumeData(data, existingResume);

     set({ 
      isReviewing: true, 
      currentResume: reviewData,
      result: null 
    });
  },
  
  setIsEditing: () => {
    set({ isReviewing: false, result: null });
  },

  setGenerationResult: (response) => {
    set((state) => {
      // When generation is successful, update the current resume in the store with the saved ID if it was new
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
