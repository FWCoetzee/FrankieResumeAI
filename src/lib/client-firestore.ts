
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
 * @param data The full resume data object to save.
 */
export function saveOrUpdateResumeDataClient(
  userId: string,
  data: ResumeData
): void {
  const { firestore } = initializeFirebase();
  const resumeId = data.resumeId || uuidv4();
  // Correct path: /users/{userId}/resumes/{resumeId}
  const resumeDocRef = doc(firestore, 'users', userId, 'resumes', resumeId);

  const isNew = !data.resumeId;

  if (isNew) {
    const dataToSave = {
      ...data,
      resumeId: resumeId,
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Use a write batch to ensure atomic creation of user and resume docs
    const batch = writeBatch(firestore);
    
    // 1. Ensure the parent user document exists.
    const userDocRef = doc(firestore, 'users', userId);
    batch.set(userDocRef, { 
        userId: userId, 
        email: data.userEmail, // Assuming userEmail is passed in data for creation
        displayName: data.userName, // Assuming userName is passed
        updatedAt: serverTimestamp() 
    }, { merge: true });

    // 2. Create the new resume document in the subcollection.
    batch.set(resumeDocRef, dataToSave);

    // Commit the batch
    batch.commit().catch(error => {
        console.error("Firestore batch write failed for new resume:", error);
    });

  } else {
    const dataToUpdate = {
        ...data,
        updatedAt: serverTimestamp(),
    };
    // Ensure critical fields are not changed on update
    delete (dataToUpdate as any).ownerId;
    delete (dataToUpdate as any).createdAt;

    updateDoc(resumeDocRef, dataToUpdate).catch(error => {
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
