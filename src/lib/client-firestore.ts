
'use client';

import {
  doc,
  setDoc,
  updateDoc,
  writeBatch,
  serverTimestamp,
} from 'firebase/firestore';
import type { ResumeData } from '@/lib/schema';
import { v4 as uuidv4 } from "uuid";
import { initializeFirebase } from '@/firebase';

/**
 * Creates or updates a resume document in the /users/{userId}/resumes subcollection.
 * This is a non-blocking operation.
 * @param userId The ID of the current user.
 * @param data The full resume data object to save. It should include userName and userEmail for creation.
 */
export function saveOrUpdateResumeDataClient(
  userId: string,
  data: ResumeData & { userName: string | null, userEmail: string | null }
): void {
  const { firestore } = initializeFirebase();
  const resumeId = data.resumeId || uuidv4();
  // Correct path: /users/{userId}/resumes/{resumeId}
  const resumeDocRef = doc(firestore, 'users', userId, 'resumes', resumeId);

  const isNew = !data.resumeId;

  const dataToSave = {
    ...data,
    resumeId: resumeId, // Ensure ID is part of the document
    ownerId: userId, // Enforce ownership
    updatedAt: serverTimestamp(),
  };
  
  // These were for user creation and should not be in the resume document
  delete (dataToSave as any).userName;
  delete (dataToSave as any).userEmail;


  if (isNew) {
    // For a new resume, we ensure the user document exists and create the resume atomically.
    const batch = writeBatch(firestore);
    const userDocRef = doc(firestore, 'users', userId);

    // 1. Set/merge user profile info.
    batch.set(userDocRef, {
      userId: userId,
      email: data.userEmail,
      displayName: data.userName,
      updatedAt: serverTimestamp(),
    }, { merge: true });

    // 2. Create the new resume document with a creation timestamp.
    batch.set(resumeDocRef, { ...dataToSave, createdAt: serverTimestamp() });

    batch.commit().catch(error => {
      console.error("Firestore batch write failed for new resume:", error);
    });

  } else {
    // For an existing resume, we just update it.
    // Ensure critical fields are not overwritten on update.
    delete (dataToSave as any).ownerId;
    delete (dataToSave as any).createdAt;

    updateDoc(resumeDocRef, dataToSave).catch(error => {
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
  updateDoc(docRef, { isDeleted: true, updatedAt: serverTimestamp() }).catch(error => {
    console.error("Failed to delete resume:", error);
  });
}
