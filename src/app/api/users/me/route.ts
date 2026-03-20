import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function GET(request: Request) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
    }

    const db = getDb();
    try {
        const userRes = await db.query('SELECT id, firebase_uid, email, display_name, plan FROM users WHERE firebase_uid = $1', [user.uid]);
        
        if (userRes.rows.length === 0) {
            // This case might happen if user exists in Firebase Auth but not in our DB.
            // We can choose to create them here or handle it as an error.
            // For now, we'll treat it as a "not found" case.
            return NextResponse.json({ error: 'User profile not found in database.' }, { status: 404 });
        }

        const userProfile = userRes.rows[0];
        
        return NextResponse.json(userProfile);

    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
