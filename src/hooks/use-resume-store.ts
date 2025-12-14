
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData, GeneratedResumeData } from '@/lib/schema';
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { useToast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from "uuid";

export type GenerationResult = {
  resume?: GeneratedResumeData;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
  error?: string;
};

interface ResumeState {
  currentResume: ResumeData | null;
  result: GenerationResult | null;
  isLoading: boolean;
  isReviewing: boolean;
}

interface ResumeActions {
  setCurrentResume: (resume: ResumeData | null) => void;
  clearCurrentResume: (idToClear?: string) => void;
  setFormForReview: (data: ResumeData) => void;
  setIsEditing: () => void;
  generateAndSetResults: (response: GenerationResult, formData: ResumeData) => void;
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
      clearCurrentResume: (idToClear) => {
        const { currentResume } = get();
        // If an ID is provided, only clear if it matches the current resume
        if (idToClear && currentResume?.resumeId !== idToClear) {
          return;
        }
        set({ ...initialState });
      },
      setFormForReview: (data) => {
        set({ 
          isReviewing: true, 
          currentResume: { ...get().currentResume, ...data } as ResumeData,
          result: null,
        });
      },
      setIsEditing: () => {
        set({ isReviewing: false, result: null });
      },
      generateAndSetResults: (response, formData) => {
        const { toast } = useToast();
        set({ isLoading: true, isReviewing: false, result: null });

        if (response.error || !response.resume) {
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: response.error || "An unknown error occurred.",
          });
          set({ isLoading: false, isReviewing: true, result: null });
        } else {
          toast({
            title: "Success!",
            description: formData.resumeId ? "Your resume has been updated." : "Your new resume has been saved and generated.",
          });
          
          const newCurrentResume: ResumeData = {
            ...formData,
            resumeId: formData.resumeId || get().currentResume?.resumeId || uuidv4(),
          };

          set({
            isLoading: false,
            isReviewing: false,
            result: response,
            currentResume: newCurrentResume,
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
      // We only persist the currentResume. Other state is transient.
      partialize: (state) => ({ currentResume: state.currentResume }),
    }
  )
);
