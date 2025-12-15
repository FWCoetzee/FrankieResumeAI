
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
  if (typeof window !== 'undefined') {
    // Pass your reCAPTCHA v3 site key (public key) to activate.
    // You can find this in your Firebase project settings -> App Check -> Apps -> Your Web App.
    // Make sure you have selected "reCAPTCHA Enterprise" or "reCAPTCHA v3" in the console.
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider('6LeIxAcpAAAAAJu-5A_PM_T2W_x8S9vYgBfub2k6'),

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
