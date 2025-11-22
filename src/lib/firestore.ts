
'use server';

import * as admin from 'firebase-admin';
import type { ResumeData } from '@/lib/schema';
import { randomUUID } from 'crypto';

// This is a one-time operation.
// We check if `admin.apps` has any apps already initialized.
if (!admin.apps.length) {
  // We are on the server, so we can use environment variables.
  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (serviceAccountKey) {
    try {
      const serviceAccount = JSON.parse(serviceAccountKey);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch (error) {
      console.error('Error parsing Firebase service account key:', error);
    }
  } else {
    console.warn(
      'FIREBASE_SERVICE_ACCOUNT_KEY not found. Firebase Admin SDK will not be initialized. This is expected for local client-side development but will fail for server-side operations.'
    );
  }
}

// We only get the firestore instance if the app was initialized.
const db = admin.apps.length ? admin.firestore() : null;

/**
 * Saves resume data to Firestore for a specific user.
 * @param userId The ID of the user.
 * @param data The resume data to save.
 * @returns The ID of the saved resume document.
 */
export async function saveResumeData(userId: string, data: ResumeData): Promise<string> {
  if (!db) {
    console.error('Firestore is not initialized. Cannot save resume data. Make sure the FIREBASE_SERVICE_ACCOUNT_KEY is set in your environment variables.');
    throw new Error('Firestore is not initialized. Server-side configuration is missing.');
  }

  const resumeId = randomUUID();
  const docRef = db.collection('users').doc(userId).collection('resumeData').doc(resumeId);

  const dataToSave = {
    ...data,
    id: resumeId,
    userId: userId,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  await docRef.set(dataToSave);

  return resumeId;
}
