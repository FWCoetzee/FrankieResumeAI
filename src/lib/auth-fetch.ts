
'use client';

import { getAuth, onIdTokenChanged, type User } from "firebase/auth";

async function getFirebaseToken(): Promise<string> {
    const auth = getAuth();
    
    // If we have a current user, try to get the token immediately.
    if (auth.currentUser) {
        try {
            return await auth.currentUser.getIdToken();
        } catch (error) {
            console.error("authFetch: Error getting ID token for current user.", error);
            return Promise.reject(new Error("Could not verify user identity."));
        }
    }

    // If there's no current user, we wait for the auth state to be resolved.
    // This is crucial for handling the initial page load race condition.
    return new Promise((resolve, reject) => {
        const unsubscribe = onIdTokenChanged(auth, async (user) => {
            unsubscribe(); // Stop listening after we get the first update.
            if (user) {
                try {
                    const token = await user.getIdToken();
                    resolve(token);
                } catch (error) {
                    console.error("authFetch: Error getting ID token after state change.", error);
                    reject(new Error("Could not verify user identity."));
                }
            } else {
                // If the user is not logged in after the check, we reject.
                reject(new Error("User is not authenticated."));
            }
        }, (error) => {
            // This handles errors during the auth state observation.
            unsubscribe();
            console.error("authFetch: Error observing auth state.", error);
            reject(new Error("Authentication check failed."));
        });
    });
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
        const token = await getFirebaseToken();

        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);

        const updatedOptions: RequestInit = {
            ...options,
            headers,
        };

        return fetch(url, updatedOptions);

    } catch (error) {
        // This will catch errors from getFirebaseToken (e.g., user not authenticated).
        console.error(`authFetch: Authentication error before fetching ${url}.`, error);
        // We simulate a 401 response so the calling code can handle it consistently.
        const errorResponse = {
            error: error instanceof Error ? error.message : "Authentication Failed",
        };
        return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
