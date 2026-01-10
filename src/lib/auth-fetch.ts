
'use client';

import { getAuth, type User } from "firebase/auth";

async function getFirebaseToken(): Promise<string | null> {
    const auth = getAuth();
    const currentUser = auth.currentUser;

    if (!currentUser) {
        console.warn("authFetch: No current user found.");
        return null;
    }

    try {
        return await currentUser.getIdToken();
    } catch (error) {
        console.error("authFetch: Error getting ID token.", error);
        return null;
    }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = await getFirebaseToken();

    const headers = new Headers(options.headers);

    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    } else {
        // If there's no token, we can decide whether to proceed or not.
        // For this app, most API calls will require auth, so failing fast might be an option.
        // However, we'll let the server decide and just log a warning here.
        console.warn(`authFetch: No token available for request to ${url}. The request will likely be unauthorized.`);
    }

    const updatedOptions: RequestInit = {
        ...options,
        headers,
    };

    return fetch(url, updatedOptions);
}
