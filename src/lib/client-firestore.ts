
'use client';

import {
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
  collection,
} from 'firebase/firestore';
import type { ResumeData } from '@/lib/schema';
import { v4 as uuidv4 } from "uuid";
import { initializeFirebase } from '@/firebase';

/**
 * Creates or updates a resume document in the /users/{userId}/resumes subcollection.
 * This is a non-blocking operation.
 * @param userId The ID of the current user.
 * @param data The full resume data object to save.
 */
export function saveOrUpdateResumeDataClient(
  userId: string,
  data: ResumeData
): void {
  const { firestore } = initializeFirebase();
  const resumeId = data.resumeId || uuidv4();
  // Correct path: /users/{userId}/resumes/{resumeId}
  const docRef = doc(firestore, 'users', userId, 'resumes', resumeId);

  const isNew = !data.resumeId;

  // We explicitly create the user document to ensure it exists before writing to a subcollection.
  // This prevents certain edge-case security rule failures.
  const userDocRef = doc(firestore, 'users', userId);
  setDoc(userDocRef, { userId: userId }, { merge: true });

  if (isNew) {
    const dataToSave = {
      ...data,
      resumeId: resumeId,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    setDoc(docRef, dataToSave).catch(error => {
        console.error("Firestore setDoc failed:", error);
    });
  } else {
    const dataToUpdate = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    // Ensure critical fields are not changed on update
    delete (dataToUpdate as any).ownerId;
    delete (dataToUpdate as any).createdAt;

    updateDoc(docRef, dataToUpdate).catch(error => {
        console.error("Firestore updateDoc failed:", error);
    });
  }
}

/**
 * Deletes a resume document from the /users/{userId}/resumes subcollection.
 * This can be a soft delete by setting `isDeleted: true`.
 * @param userId The ID of the current user.
 * @param resumeId The ID of the resume document to delete.
 */
export function deleteResumeDataClient(
  userId: string,
  resumeId: string
): void {
  const { firestore } = initializeFirebase();
  // Correct path: /users/{userId}/resumes/{resumeId}
  const docRef = doc(firestore, 'users', userId, 'resumes', resumeId);
  
  // Perform a soft delete by updating the isDeleted flag
  const batch = writeBatch(firestore);
  batch.update(docRef, { isDeleted: true, updatedAt: serverTimestamp() });

  batch.commit().catch(error => {
    console.error("Failed to delete resume:", error);
  });
}
