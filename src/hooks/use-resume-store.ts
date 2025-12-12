
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { ResumeData, GeneratedResumeData } from '@/lib/schema';
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { useToast } from "@/hooks/use-toast";

export type GenerationResult = {
  resume?: GeneratedResumeData;
  suggestions?: string;
  coverLetter?: string;
  linkedin?: GenerateLinkedInProfileOutput;
  error?: string;
};

interface ResumeState {
  // FORM DATA - The raw data from the form, source of truth for generation.
  currentResume: ResumeData | null;
  // AI-GENERATED DATA - The structured and polished data returned from the AI.
  result: GenerationResult | null;
  // UI STATE - Controls the flow of the resume builder.
  isLoading: boolean;
  isReviewing: boolean; // Is the user in the "review before generating" step?
}

interface ResumeActions {
  // FORM ACTIONS
  setCurrentResume: (resume: ResumeData | null) => void;
  setInitialData: (data: ResumeData) => void;
  clearCurrentResume: (idToClear?: string) => void;
  
  // UI STATE ACTIONS
  setFormForReview: (data: ResumeData) => void;
  setIsEditing: () => void;
  
  // AI GENERATION ACTIONS
  generateAndSetResults: (response: GenerationResult, formData: ResumeData) => void;
  updateResult: (newResult: GenerationResult) => void;
}

const initialState: ResumeState = {
  currentResume: null,
  result: null,
  isLoading: false,
  isReviewing: false,
};

export const useResumeStore = create<ResumeState & ResumeActions>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // FORM ACTIONS
      setCurrentResume: (resume) => {
        set({
          currentResume: resume,
          result: null, // Clear old results when loading a new resume
          isReviewing: false,
          isLoading: false,
        });
      },
      setInitialData: (data) => {
        if (!get().currentResume) {
          set({ currentResume: data });
        }
      },
      clearCurrentResume: (idToClear) => {
        const { currentResume } = get();
        if (idToClear && currentResume?.id !== idToClear) {
          return;
        }
        set(initialState); // Reset to the initial state
      },
      
      // UI STATE ACTIONS
      setFormForReview: (data) => {
        set({ 
          isReviewing: true, 
          currentResume: { ...data, id: get().currentResume?.id },
          result: null,
        });
      },
      setIsEditing: () => {
        set({ isReviewing: false, result: null });
      },
      
      // AI GENERATION ACTIONS
      generateAndSetResults: (response, formData) => {
        const { toast } = useToast();
        set({ isLoading: true, isReviewing: false, result: null });

        if (response.error || !response.resume) {
          toast({
            variant: "destructive",
            title: "Generation Failed",
            description: response.error || "An unknown error occurred.",
          });
          set({ isLoading: false, isReviewing: true, result: null }); // Go back to review on error
        } else {
          toast({
            title: "Success!",
            description: formData.id ? "Your resume has been updated." : "Your new resume has been saved and generated.",
          });
          set({
            isLoading: false,
            isReviewing: false,
            result: response,
            currentResume: formData, // The generated data is now the current data
          });
        }
      },
      updateResult: (newResult) => {
        set({ result: newResult });
      }
    }),
    {
      name: 'resume-storage',
      storage: createJSONStorage(() => localStorage),
      // Only persist the 'currentResume' field
      partialize: (state) => ({ currentResume: state.currentResume }),
    }
  )
);
