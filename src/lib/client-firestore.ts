
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
import { omit } from 'lodash';

/**
 * Creates or updates a resume document in the /users/{userId}/resumes subcollection.
 * This is a non-blocking operation.
 * @param userId The ID of the current user.
 * @param data The full resume data object to save. It may include extra fields like userName for new users.
 */
export function saveOrUpdateResumeDataClient(
  userId: string,
  data: ResumeData & { userName?: string | null, userEmail?: string | null }
): void {
  const { firestore } = initializeFirebase();
  
  // If the resume has a non-empty resumeId, it's an update. Otherwise, it's a new creation.
  const isNewResume = !data.resumeId;
  const resumeId = isNewResume ? uuidv4() : data.resumeId;

  // The path is now ALWAYS in the user's private subcollection.
  const resumeDocRef = doc(firestore, 'users', userId, 'resumes', resumeId);
  const userDocRef = doc(firestore, 'users', userId);

  // Use Lodash's omit to create a clean data object for saving,
  // removing any temporary client-side fields.
  const dataToSave: ResumeData = omit(data, ['userName', 'userEmail']);
  
  const batch = writeBatch(firestore);

  // Always ensure the user document has the latest profile info and timestamp.
  // Using merge:true prevents overwriting existing user data like `plan` or `preferences`.
  batch.set(userDocRef, {
    userId: userId,
    email: data.userEmail,
    displayName: data.userName,
    updatedAt: serverTimestamp(),
  }, { merge: true });

  if (isNewResume) {
    // For a brand new resume, create it with all required fields.
    const newResumeData: ResumeData = {
      ...dataToSave,
      resumeId: resumeId, // Set the newly generated ID
      ownerId: userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };
    batch.set(resumeDocRef, newResumeData);
  } else {
    // For an existing resume, update it.
    // We omit fields that should never change after creation.
    const updateData = omit(dataToSave, ['resumeId', 'ownerId', 'createdAt']);
    batch.update(resumeDocRef, {
      ...updateData,
      updatedAt: serverTimestamp(), // Always update the timestamp
    });
  }

  // Commit the atomic operation.
  batch.commit().catch(error => {
    console.error("Firestore batch write failed:", error);
    // Here, we would ideally emit a global error for a toast notification.
  });
}

/**
 * Deletes a resume document from the /users/{userId}/resumes subcollection.
 * This is a soft delete by setting `isDeleted: true`.
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
