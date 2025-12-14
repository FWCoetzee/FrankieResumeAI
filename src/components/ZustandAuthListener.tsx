
'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@/firebase';
import { useResumeStore, createNewBlankResume } from '@/hooks/use-resume-store';

/**
 * An invisible component that listens to Firebase auth state changes
 * and synchronizes the Zustand store accordingly.
 */
export function ZustandAuthListener() {
  const { user, isUserLoading } = useUser();
  const { reset, setCurrentResume } = useResumeStore();
  const initialLoadDone = useRef(false);

  useEffect(() => {
    // Wait until the initial user loading is complete
    if (isUserLoading) {
      return;
    }

    if (!user) {
      // User has logged out or is not logged in.
      // Clear the persisted storage and reset the store to its initial state.
      useResumeStore.persist.clearStorage();
      reset();
    } else {
      // User is logged in.
      // If this is the first load after authentication check,
      // we might want to ensure the store is in a good state.
      if (!initialLoadDone.current) {
        const current = useResumeStore.getState().currentResume;
        if (!current || !current.ownerId) {
            // If the store has no resume or one without an owner,
            // set it to a new blank one for the current user.
            setCurrentResume(createNewBlankResume(user.uid));
        } else if (current.ownerId !== user.uid) {
            // If the stored resume belongs to a different user, clear it.
            useResumeStore.persist.clearStorage();
            setCurrentResume(createNewBlankResume(user.uid));
        }
        initialLoadDone.current = true;
      }
    }

  }, [user, isUserLoading, reset, setCurrentResume]);

  // This component does not render anything.
  return null;
}
