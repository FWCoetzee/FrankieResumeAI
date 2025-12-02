
'use client';

import {
  doc,
  setDoc,
  serverTimestamp,
  Firestore,
} from 'firebase/firestore';
import type { ResumeFormData } from '@/lib/schema';
import { v4 as uuidv4 } from "uuid";
import { setDocumentNonBlocking, updateDocumentNonBlocking } from '@/firebase/non-blocking-updates';

/**
 * Creates or updates resume data in Firestore for a specific user.
 * This is a non-blocking operation.
 * @param firestore The Firestore instance.
 * @param userId The ID of the user.
 * @param resumeId The ID of the resume document (if it exists).
 * @param data The resume data to save.
 */
export function saveOrUpdateResumeDataClient(
  firestore: Firestore,
  userId: string,
  resumeId: string | null,
  data: ResumeFormData
): void {
  if (resumeId) {
    // We have an ID, so we are updating an existing document.
    const docRef = doc(firestore, 'users', userId, 'resumeData', resumeId);
    
    const dataToUpdate = {
      ...data,
      updatedAt: serverTimestamp(),
    };
    
    // Use the non-blocking update function
    updateDocumentNonBlocking(docRef, dataToUpdate);

  } else {
    // No ID, so we are creating a new document.
    const newId = uuidv4();
    const docRef = doc(firestore, 'users', userId, 'resumeData', newId);

    const dataToSave = {
      ...data,
      id: newId, // Add the new ID to the document data
      userId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    
    // Use the non-blocking set function for creation
    setDocumentNonBlocking(docRef, dataToSave, {});
  }
}
