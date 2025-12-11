
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ResumeData } from '@/lib/schema';

interface ResumeStore {
  // The resume data currently loaded in the form.
  currentResume: ResumeData | null;
  setCurrentResume: (resume: ResumeData | null) => void;
  // A temporary holding spot for data that's about to be sent to the AI.
  formActionData: ResumeData | null;
  setFormActionData: (resume: ResumeData | null) => void;
  // A function to clear the current resume, optionally by ID.
  clearCurrentResume: (idToClear?: string) => void;
  // New function to set initial data from onboarding
  setInitialData: (data: ResumeData) => void;
}

export const useResumeStore = create<ResumeStore>()(
  persist(
    (set, get) => ({
      currentResume: null,
      formActionData: null,
      setCurrentResume: (resume) => set({ currentResume: resume, formActionData: resume }),
      setFormActionData: (resume) => set({ formActionData: resume }),
      clearCurrentResume: (idToClear) => {
        const { currentResume } = get();
        // If an ID is provided, only clear if it matches the current resume.
        if (idToClear && currentResume?.id !== idToClear) {
          return;
        }
        // If no ID or a matching ID, clear the state.
        set({ currentResume: null, formActionData: null });
      },
      setInitialData: (data) => {
        // This function should ONLY set the data if the store is currently empty
        // to avoid overwriting a user's existing session.
        if (!get().currentResume) {
          set({ currentResume: data, formActionData: data });
        }
      },
    }),
    {
      name: 'resume-storage', // name of the item in the storage (must be unique)
      storage: createJSONStorage(() => localStorage), // use localStorage
    }
  )
);
