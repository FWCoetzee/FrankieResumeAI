
'use server';

import * as admin from 'firebase-admin';
import type { ResumeData } from '@/lib/schema';
import { randomUUID } from 'crypto';

const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY
  ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
  : null;

if (!admin.apps.length) {
    if (serviceAccount) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } else {
      // Fallback for local development
      console.warn("Firebase service account key not found. Initializing with default credentials. This is intended for local development only.");
      admin.initializeApp();
    }
}


const db = admin.firestore();

/**
 * Saves resume data to Firestore for a specific user.
 * @param userId The ID of the user.
 * @param data The resume data to save.
 * @returns The ID of the saved resume document.
 */
export async function saveResumeData(userId: string, data: ResumeData): Promise<string> {
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
