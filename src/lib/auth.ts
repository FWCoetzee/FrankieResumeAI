
import { headers } from 'next/headers';
import { DecodedIdToken, getAuth as getAdminAuth } from 'firebase-admin/auth';
import {
  initializeApp,
  getApps,
  App as AdminApp,
  applicationDefault,
} from 'firebase-admin/app';
import { firebaseConfig } from '@/firebase/config';

// This function initializes the Firebase Admin SDK.
// It's designed to be safely called multiple times.
function initializeAdminApp(): AdminApp {
  // Return the initialized app if it already exists
  if (getApps().length) {
    return getApps()[0]!;
  }

  // Otherwise, initialize the app.
  // Using applicationDefault() is the recommended way for Google Cloud environments
  // like Cloud Run, Cloud Functions, and App Hosting. It automatically finds
  // the service account credentials from the environment.
  console.log("Initializing Firebase Admin SDK...");
  try {
    const app = initializeApp({
      credential: applicationDefault(),
      projectId: firebaseConfig.projectId, // Explicitly setting projectId is a good practice.
    });
    console.log("Firebase Admin SDK initialized successfully.");
    return app;
  } catch (error: any) {
      console.error("FATAL: Failed to initialize Firebase Admin SDK.", error);
      throw new Error(`Could not initialize Firebase Admin SDK: ${error.message}`);
  }
}

/**
 * Retrieves the decoded user token from the request headers.
 * This function implements a dual strategy for authentication:
 * 1. Production (Firebase App Hosting): Relies on the 'X-Firebase-User' header,
 *    which is securely added by the App Hosting infrastructure.
 * 2. Local Development: Falls back to verifying the 'Authorization: Bearer' token
 *    using the Firebase Admin SDK. This allows local dev to mimic production auth.
 *
 * @param request The incoming Next.js Request object.
 * @returns The decoded user token if present and valid, otherwise null.
 */
export async function getAuthenticatedUser(request: Request): Promise<DecodedIdToken | null> {
    const userHeader = request.headers.get('X-Firebase-User');

    // STRATEGY 1: Production Environment (Firebase App Hosting)
    if (userHeader) {
        try {
            const decodedUser = JSON.parse(Buffer.from(userHeader, 'base64').toString());
            return decodedUser as DecodedIdToken;
        } catch (error) {
            console.error('Error decoding X-Firebase-User header:', error);
            return null;
        }
    }

    // STRATEGY 2: Local Development Environment
    const authHeader = request.headers.get('Authorization');
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.split('Bearer ')[1];
        if (token) {
            try {
                // Initialize Admin SDK and verify the token
                const adminApp = initializeAdminApp();
                const adminAuth = getAdminAuth(adminApp);
                const decodedToken = await adminAuth.verifyIdToken(token);
                return decodedToken;
            } catch (error: any) {
                // This is the critical logging to diagnose the issue.
                console.error(`[AUTH_ERROR] Failed to verify ID token during local development. Code: ${error.code}. Message: ${error.message}`);
                return null;
            }
        }
    }

    // If neither strategy succeeds, there is no authenticated user.
    return null;
}
