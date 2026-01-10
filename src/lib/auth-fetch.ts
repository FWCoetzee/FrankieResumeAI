
'use client';

import { getAuth } from "firebase/auth";

async function getFirebaseToken(): Promise<string> {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        // If there's no user, we can't get a token.
        return Promise.reject(new Error("No user is currently signed in."));
    }

    try {
        // This method automatically handles token refreshing.
        return await currentUser.getIdToken(true);
    } catch (error) {
        console.error("authFetch: Error getting ID token.", error);
        return Promise.reject(new Error("Could not verify user identity. Please sign in again."));
    }
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
        // This catches errors from getFirebaseToken (e.g., user not authenticated).
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
