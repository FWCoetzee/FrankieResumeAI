
import { headers } from 'next/headers';
import { DecodedIdToken, getAuth as getAdminAuth } from 'firebase-admin/auth';
import { initializeApp, getApps, App as AdminApp, ServiceAccount, cert } from 'firebase-admin/app';

// This function initializes the Firebase Admin SDK.
// It's designed to be safely called multiple times.
function initializeAdminApp(): AdminApp {
    const apps = getApps();
    if (apps.length > 0) {
        return apps[0]!;
    }

    // When deployed to App Hosting, GOOGLE_APPLICATION_CREDENTIALS is automatically set.
    // For local development, you must set this environment variable to point to your service account key file.
    // See: https://firebase.google.com/docs/admin/setup#initialize-sdk
    const credential = process.env.GOOGLE_APPLICATION_CREDENTIALS
        ? cert(JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS))
        : undefined;
    
    return initializeApp({ credential });
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
            } catch (error) {
                console.error('Error verifying Firebase ID token in local dev:', error);
                return null;
            }
        }
    }

    // If neither strategy succeeds, there is no authenticated user.
    return null;
}
