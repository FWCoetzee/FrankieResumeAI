
import { headers } from 'next/headers';
import { DecodedIdToken } from 'firebase-admin/auth';

/**
 * Retrieves the decoded user token from the request headers.
 * This relies on Firebase App Hosting's `requireLogin: true` feature,
 * which validates the token and passes user info in a base64-encoded header.
 *
 * @param request The incoming Next.js request object.
 * @returns The decoded user token if present and valid, otherwise null.
 */
export async function getAuthenticatedUser(request: Request): Promise<DecodedIdToken | null> {
    const userHeader = request.headers.get('X-Firebase-User');

    if (!userHeader) {
        // Fallback for local development or if header is missing
        const authHeader = request.headers.get('Authorization');
        if (authHeader?.startsWith('Bearer ')) {
            // In a real app, you might validate this token with the Admin SDK,
            // but for the dev flow, we're assuming the client sends a valid one.
            // For production on App Hosting, X-Firebase-User is the source of truth.
             console.warn("Using Authorization header for auth. This should only happen in local development.");
             // This path is not secure for production.
        }
        return null;
    }

    try {
        const decodedUser = JSON.parse(Buffer.from(userHeader, 'base64').toString());
        return decodedUser as DecodedIdToken;
    } catch (error) {
        console.error('Error decoding X-Firebase-User header:', error);
        return null;
    }
}
