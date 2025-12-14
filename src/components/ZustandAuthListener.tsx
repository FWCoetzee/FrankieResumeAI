
'use client';

import { useEffect } from 'react';
import { useUser } from '@/firebase';
import { useResumeStore } from '@/hooks/use-resume-store';

/**
 * An invisible component that listens to Firebase auth state changes
 * and synchronizes the Zustand store accordingly.
 * @deprecated This approach has race conditions. State is now managed more directly in components.
 */
export function ZustandAuthListener() {
  const { user, isUserLoading } = useUser();
  const { reset, currentResume, setCurrentResume } = useResumeStore();

  useEffect(() => {
    // This component is being deprecated as its logic is moved into
    // more direct data-fetching patterns within components like ResumeHistory.
    // The previous implementation had race conditions that were difficult to solve
    // reliably with a global listener.
  }, [user, isUserLoading, reset, currentResume, setCurrentResume]);

  // This component does not render anything.
  return null;
}
