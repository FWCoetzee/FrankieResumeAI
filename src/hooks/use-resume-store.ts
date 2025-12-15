
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData, GeneratedResumeData, ResumeFormData } from '@/lib/schema';
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { useToast } from "@/hooks/use-toast";
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
  setFormForReview: (data: ResumeFormData) => void;
  setIsEditing: () => void;
  generateAndSetResults: (response: GenerationResult, formData: ResumeFormData) => void;
  updateResult: (newResult: GenerationResult) => void;
  reset: () => void;
}

const initialState: ResumeState = {
  currentResume: null,
  result: null,
  isLoading: false,
  isReviewing: false,
};

export const createNewBlankResume = (ownerId: string = ''): ResumeData => ({
    resumeId: uuidv4(),
    ownerId: ownerId,
    title: 'New Resume',
    templateId: 'modern',
    status: 'draft',
    sections: {
        summary: { content: '', lastEdited: new Date().toISOString() },
        experience: [],
        education: [],
        skills: [],
    },
    settings: { fontSize: 10, spacing: 'normal' },
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
});

export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set, get) => ({
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
        // Create a basic representation for review
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
          result: null,
        });
      },
      setIsEditing: () => {
        set({ isReviewing: false, result: null });
      },
      generateAndSetResults: (response, formData) => {
        set({ isLoading: true, isReviewing: false, result: null });

        if (response.error || !response.resume) {
          set({ isLoading: false, isReviewing: true, result: response });
        } else {
          // Update currentResume with the newly saved ID if it exists
          if (response.savedResumeId) {
            const updatedResume = { ...get().currentResume, resumeId: response.savedResumeId, ownerId: get().currentResume?.ownerId || '' };
            set({
                currentResume: updatedResume as ResumeData
            });
          }
          set({
            isLoading: false,
            isReviewing: false,
            result: response,
          });
        }
      },
      updateResult: (newResult) => {
        set({ result: newResult });
      },
      reset: () => {
        set(initialState);
      }
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ currentResume: state.currentResume }),
    }
  )
);
