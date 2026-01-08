
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
      result: null, // Clear previous results when a new resume is loaded
      isReviewing: false,
      isLoading: false,
    });
  },

  clearCurrentResume: () => {
    // When clearing, we don't nullify the object entirely, but reset it to a state
    // that represents a new, unsaved resume. This preserves the flow.
    const newResume: ResumeData = {
        resumeId: '', // An empty resumeId signifies a new, unsaved document
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
            references: [],
        },
        settings: { fontSize: 10, spacing: 'normal' },
        isDeleted: false,
    };
    set({ currentResume: newResume, result: null, isReviewing: false, isLoading: false });
  },

  setFormForReview: (data) => {
     // Get the current resume from the store. It might be null or an existing resume.
     const currentResume = get().currentResume;

     // If there's an existing resume, preserve its ID. Otherwise, it's a new resume.
     const resumeId = currentResume?.resumeId || '';

     const reviewData: Partial<ResumeData> = {
        resumeId: resumeId,
        title: data.title,
        templateId: data.templateId,
        sections: {
            summary: { content: data.sections.summary?.content || '', lastEdited: new Date().toISOString() },
            experience: (data.sections.experience || []).map((exp, index) => ({ ...exp, id: exp.id || uuidv4(), startDate: exp.startDate ? new Date(exp.startDate).toISOString() : '', endDate: exp.endDate && exp.endDate !== 'Present' ? new Date(exp.endDate).toISOString() : null, bullets: exp.bullets || [], order: index })),
            education: (data.sections.education || []).map((edu, index) => ({...edu, id: edu.id || uuidv4(), order: index })),
            skills: data.sections.skills || [],
            projects: (data.sections.projects || []).map((proj, index) => ({...proj, id: proj.id || uuidv4(), description: proj.description || '', order: index })),
            references: (data.sections.references || []).map((ref, index) => ({...ref, id: ref.id || uuidv4(), order: index })),
        }
    };

    set({ 
      isReviewing: true, 
      currentResume: { ...currentResume, ...reviewData } as ResumeData,
      result: null 
    });
  },
  
  setIsEditing: () => {
    set({ isReviewing: false, result: null });
  },

  generateAndSetResults: (response, formData) => {
    set((state) => {
      // When generation is successful, update the current resume in the store with the saved ID
      const updatedResume = state.currentResume && response.savedResumeId
        ? { ...state.currentResume, resumeId: response.savedResumeId }
        : state.currentResume;

      return {
        ...state,
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
