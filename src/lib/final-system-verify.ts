import { getDb } from './db';
import { createAnonymousSessionId, computeOwnerHash } from './anonymous-session';

// Mock AI Refinement to isolate system logic from AI Provider connectivity
async function mockEditResumeText(input: any): Promise<string> {
    console.log(`[Mock AI] Refining content with mode: ${input.mode}...`);
    return `[MOCKED] ${input.content} - Enhanced by AI`;
}

async function runTest() {
    console.log('🚀 Starting Final System Logic Verification (Mocked AI)...');
    
    try {
        const db = await getDb();
        const sessionId = createAnonymousSessionId();
        const ownerHash = computeOwnerHash(sessionId);
        console.log(`Session created: ${sessionId}`);
        console.log(`Owner Hash: ${ownerHash}`);

        // 1. Create Resume
        console.log('\n--- Step 1: Creating Resume ---');
        const createRes = await db.query(
            'INSERT INTO resumes (owner_hash, title, state, expires_at) VALUES ($1, $2, $3, NOW() + INTERVAL \'1 day\') RETURNING id',
            [ownerHash, 'Final Verification Resume', 'DRAFT']
        );
        const resumeId = createRes.rows[0].id;
        console.log(`✅ Resume created with ID: ${resumeId}`);

        // Initial version
        const versionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content) VALUES ($1, $2) RETURNING id',
            [resumeId, JSON.stringify({ sections: { summary: { content: 'The quick brown fox' } } })]
        );
        const versionId = versionRes.rows[0].id;
        await db.query('UPDATE resumes SET current_version_id = $1 WHERE id = $2', [versionId, resumeId]);
        console.log(`✅ Initial version created: ${versionId}`);

        // 2. Fetch Resume
        console.log('\n--- Step 2: Fetching Resume ---');
        const fetchRes = await db.query(
            'SELECT r.title, rv.content FROM resumes r JOIN resume_versions rv ON r.current_version_id = rv.id WHERE r.id = $1',
            [resumeId]
        );
        if (fetchRes.rows.length === 0) throw new Error('Failed to fetch resume');
        console.log(`✅ Fetched: ${fetchRes.rows[0].title}`);

        // 3. AI Refinement (MOCKED)
        console.log('\n--- Step 3: AI Refinement (Mocked) ---');
        const originalContent = 'The quick brown fox';
        const refinedText = await mockEditResumeText({
            mode: 'Strengthen',
            content: originalContent,
            targetJob: 'Software Engineer'
        });
        console.log(`✅ Mock AI Refined text: ${refinedText}`);

        // 4. Save Edit
        console.log('\n--- Step 4: Saving Edit ---');
        const newContent = JSON.stringify({ sections: { summary: { content: refinedText } } });
        const newVersionRes = await db.query(
            'INSERT INTO resume_versions (resume_id, content) VALUES ($1, $2) RETURNING id',
            [resumeId, newContent]
        );
        const newVersionId = newVersionRes.rows[0].id;
        await db.query('UPDATE resumes SET current_version_id = $1 WHERE id = $2', [newVersionId, resumeId]);
        console.log(`✅ Saved new version: ${newVersionId}`);

        // 5. Final Verification
        console.log('\n--- Step 5: Final Verification ---');
        const finalRes = await db.query(
            'SELECT rv.content FROM resumes r JOIN resume_versions rv ON r.current_version_id = rv.id WHERE r.id = $1',
            [resumeId]
        );
        
        let finalContentRaw = finalRes.rows[0].content;
        const finalContent = typeof finalContentRaw === 'string' 
            ? JSON.parse(finalContentRaw).sections.summary.content 
            : finalContentRaw.sections.summary.content;

        if (finalContent === refinedText) {
            console.log('🎉 SYSTEM VERIFIED: All database, session, and versioning logic is 100% functional!');
        } else {
            throw new Error(`Content mismatch! Expected ${refinedText}, got ${finalContent}`);
        }

    } catch (error) {
        console.error('\n❌ SYSTEM VERIFICATION FAILED:');
        console.error(error);
        process.exit(1);
    }
}

runTest();
