
'use client';

import { getAuth, onIdTokenChanged, type User } from "firebase/auth";

/**
 * Returns a promise that resolves with a user object once auth state is confirmed.
 * This is crucial for avoiding race conditions on initial page load or after login.
 * @returns A Promise that resolves with the Firebase User object.
 */
function getAuthenticatedUserFromClient(): Promise<User> {
    return new Promise((resolve, reject) => {
        const auth = getAuth();
        // onIdTokenChanged is more reliable than onAuthStateChanged for getting a user
        // with a valid token immediately after login or on page load.
        const unsubscribe = onIdTokenChanged(
            auth,
            (user) => {
                unsubscribe(); // Important: we only want the first emission.
                if (user) {
                    resolve(user);
                } else {
                    // This case is hit when the listener runs and confirms there is no user.
                    reject(new Error("No active user session. The user is not signed in."));
                }
            },
            (error) => {
                unsubscribe();
                // This handles actual errors within the auth listener itself.
                reject(error);
            }
        );
    });
}

/**
 * A wrapper around the native `fetch` function that automatically adds the
 * Firebase authentication token to the request headers.
 * It robustly waits for the authentication state to be resolved before making the call.
 * @param url The URL to fetch.
 * @param options The standard `fetch` options object.
 * @returns A Promise that resolves to the `Response` object.
 */
export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    try {
        // 1. Wait for the auth state to be resolved and get a confirmed user object.
        const user = await getAuthenticatedUserFromClient();
        
        // 2. Get the ID token from that user object. Using `true` forces a refresh if needed.
        const token = await user.getIdToken(true);

        // 3. Add the token to the request headers.
        const headers = new Headers(options.headers);
        headers.set('Authorization', `Bearer ${token}`);

        const updatedOptions: RequestInit = {
            ...options,
            headers,
        };

        // 4. Make the actual fetch call.
        return fetch(url, updatedOptions);

    } catch (error) {
        // This `catch` block will now correctly handle the case where `getAuthenticatedUserFromClient`
        // rejects because there is no signed-in user.
        const errorMessage = error instanceof Error ? error.message : "Authentication failed";
        console.error("authFetch Error:", errorMessage);

        // We construct a synthetic 401 response to ensure the calling code
        // handles auth failures in a consistent way.
        const errorResponse = {
            error: 'Unauthorized: No active user session.',
        };
        
        return new Response(JSON.stringify(errorResponse), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}
