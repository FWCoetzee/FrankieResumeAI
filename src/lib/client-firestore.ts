
'use client';

import {
  collection,
  doc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { ResumeData } from '@/lib/schema';
import { randomUUID } from 'crypto';
import { setDocumentNonBlocking } from '@/firebase';

/**
 * Saves resume data to Firestore for a specific user using the client-side SDK.
 * This is a non-blocking operation.
 * @param firestore The Firestore instance.
 * @param userId The ID of the user.
 * @param data The resume data to save.
 */
export function saveResumeDataClient(
  firestore: Firestore,
  userId: string,
  data: ResumeData
): void {
  // We need a unique ID for the new document.
  // Using crypto.randomUUID() is a good client-side option.
  const resumeId =
    typeof window !== 'undefined' && window.crypto?.randomUUID
      ? window.crypto.randomUUID()
      : randomUUID();

  const docRef = doc(firestore, 'users', userId, 'resumeData', resumeId);

  const dataToSave = {
    ...data,
    id: resumeId,
    userId: userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  // Use the non-blocking firestore update function
  setDocumentNonBlocking(docRef, dataToSave, { merge: true });
}
