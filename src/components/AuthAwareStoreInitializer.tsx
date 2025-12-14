
'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/firebase';
import { useResumeStore, createNewBlankResume } from '@/hooks/use-resume-store';

/**
 * An invisible component that is responsible for initializing and synchronizing
 * the Zustand store (`useResumeStore`) with the user's authentication state.
 * This is the single source of truth for loading the store on app startup.
 */
export function AuthAwareStoreInitializer() {
  const { user, isUserLoading } = useUser();
  const { currentResume, setCurrentResume, reset } = useResumeStore();
  
  // Use a ref to ensure the initialization logic runs only once.
  const initialized = useRef(false);

  useEffect(() => {
    // Wait until the initial authentication check is complete.
    if (isUserLoading) {
      return;
    }

    // Prevent this logic from running on every re-render.
    if (initialized.current) {
        return;
    }
    initialized.current = true;

    if (user) {
      // User is logged in.
      if (!currentResume || currentResume.ownerId !== user.uid) {
        // If there's no resume in the store, or the resume belongs to a different user,
        // create a new blank resume for the current user.
        setCurrentResume(createNewBlankResume(user.uid));
      }
      // If a valid resume for the current user is already in the store (from localStorage),
      // we do nothing and let it be used.
    } else {
      // User is not logged in.
      // Reset the store to its initial, empty state. This clears any lingering data.
      reset();
    }
  }, [user, isUserLoading, currentResume, setCurrentResume, reset]);

  // This component does not render anything.
  return null;
}
