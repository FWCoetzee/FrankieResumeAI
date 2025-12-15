'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

// IMPORTANT: DO NOT MODIFY THIS FUNCTION
export function initializeFirebase() {
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

  // Initialize App Check if it hasn't been already.
  // This is a crucial step for projects with App Check enforced.
  if (typeof window !== 'undefined') {
    initializeAppCheck(app, {
      // IMPORTANT: Replace this with your actual reCAPTCHA v3 site key from the Firebase console.
      // Go to Project Settings > App Check, select your web app, and find the reCAPTCHA v3 provider configuration.
      provider: new ReCaptchaV3Provider('6Lce_QsqAAAAALGEgX-2a5GEwJpT22sveiMoE65T'),

      // Optional: set to 'true' to allow app to function before token is retrieved.
      isTokenAutoRefreshEnabled: true
    });
  }

  return getSdks(app);
}

export function getSdks(firebaseApp: FirebaseApp) {
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
    storage: getStorage(firebaseApp),
  };
}

export * from './provider';
export * from './client-provider';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './storage';
