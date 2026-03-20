
import { NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { getDb } from '@/lib/db';

export async function POST(request: Request) {
    const user = await getAuthenticatedUser(request);
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized: No active user session.' }, { status: 401 });
    }

    const db = getDb();
    try {
        // Check if user already exists
        const userRes = await db.query('SELECT id FROM users WHERE firebase_uid = $1', [user.uid]);

        if (userRes.rows.length > 0) {
            // User already exists, return their profile
            const existingUser = await db.query('SELECT id, firebase_uid, email, display_name, plan FROM users WHERE firebase_uid = $1', [user.uid]);
            return NextResponse.json(existingUser.rows[0], { status: 200 });
        }

        // User does not exist, create them
        const newUserRes = await db.query(
            'INSERT INTO users (firebase_uid, email, display_name, plan) VALUES ($1, $2, $3, $4) RETURNING id, firebase_uid, email, display_name, plan',
            [user.uid, user.email, user.name, 'free'] // user.name from DecodedIdToken is displayName
        );

        return NextResponse.json(newUserRes.rows[0], { status: 201 });

    } catch (error) {
        console.error('Failed to create or find user:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
        return NextResponse.json({ error: `Internal Server Error: ${errorMessage}` }, { status: 500 });
    }
}
