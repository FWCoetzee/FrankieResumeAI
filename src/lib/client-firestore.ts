
'use client';

import {
  doc,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import type { ResumeData } from '@/lib/schema';
import { v4 as uuidv4 } from "uuid";
import { initializeFirebase } from '@/firebase';

/**
 * Creates or updates a resume document in the root /resumes collection.
 * This is a non-blocking operation.
 * @param userId The ID of the current user.
 * @param data The full resume data object to save.
 */
export function saveOrUpdateResumeDataClient(
  userId: string,
  data: ResumeData
): void {
  const { firestore } = initializeFirebase(); // Get firestore instance
  let resumeId = data.resumeId;
  let isNew = false;

  if (!resumeId) {
    // If it's a new resume, generate an ID.
    resumeId = uuidv4();
    isNew = true;
  }

  const docRef = doc(firestore, 'resumes', resumeId);
  const batch = writeBatch(firestore);

  if (isNew) {
    const dataToSave: ResumeData = {
      ...data,
      resumeId: resumeId,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: "draft",
    };
    batch.set(docRef, { ...dataToSave, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
  } else {
    // Ensure ownerId is not accidentally changed on update
    const { ownerId, createdAt, ...restOfData } = data;
    const dataToUpdate = {
      ...restOfData,
      updatedAt: serverTimestamp(),
    };
    batch.update(docRef, dataToUpdate);
  }

  // Commit the batch
  batch.commit().catch(error => {
    console.error("Failed to save resume data:", error);
    // Here you could emit a global error event if needed
  });
}

/**
 * Deletes a resume document from the /resumes collection.
 * This can be a soft delete by setting `isDeleted: true`.
 * @param userId The ID of the current user.
 * @param resumeId The ID of the resume document to delete.
 */
export function deleteResumeDataClient(
  userId: string,
  resumeId: string
): void {
  const { firestore } = initializeFirebase();
  const docRef = doc(firestore, 'resumes', resumeId);
  
  // Perform a soft delete by updating the isDeleted flag
  const batch = writeBatch(firestore);
  batch.update(docRef, { isDeleted: true, updatedAt: serverTimestamp() });

  batch.commit().catch(error => {
    console.error("Failed to delete resume:", error);
  });
}
