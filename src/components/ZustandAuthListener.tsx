
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useResumeStore } from '@/hooks/use-resume-store';

/**
 * An invisible component that listens to Firebase auth state changes
 * and synchronizes the Zustand store accordingly.
 * @deprecated This approach has race conditions and is being phased out. Logic is moving into components directly.
 */
export function ZustandAuthListener() {
  const { user, isUserLoading } = useUser();
  const { reset, currentResume, setCurrentResume } = useResumeStore();

  useEffect(() => {
    // When the auth state is done loading...
    if (!isUserLoading) {
      // If the user has logged out...
      if (!user) {
        // Clear both persisted storage and in-memory state.
        // This is the critical fix to prevent race conditions on logout.
        useResumeStore.persist.clearStorage();
        reset();
      } else if (user && currentResume) {
        // If a user is logged in and there's a resume in the store...
        // ...ensure the resume belongs to the current user.
        if (!currentResume.ownerId || currentResume.ownerId !== user.uid) {
          // If not, clear storage and set a new, correctly owned blank resume.
          useResumeStore.persist.clearStorage();
          reset();
        }
      }
    }
  }, [user, isUserLoading, reset, currentResume, setCurrentResume]);

  // This component does not render anything.
  return null;
}
