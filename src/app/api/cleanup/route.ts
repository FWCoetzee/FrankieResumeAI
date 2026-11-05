
import { NextResponse } from 'next/server';
import { cleanupExpiredResumes } from '@/lib/db-cleanup';

/**
 * API Route for triggering the database cleanup of expired resumes.
 * 
 * This route is intended to be called by an external cron service (e.g., Netlify Scheduled Functions,
 * GitHub Actions, or a dedicated cron job). 
 * 
 * Security Note: In a production environment, this route should be protected by an 
 * API key or a secret token to prevent unauthorized users from triggering 
 * database cleanup operations.
 */
export async function GET() {
  try {
    const { deletedCount } = await cleanupExpiredResumes();
    return NextResponse.json({ 
      success: true, 
      message: `Cleanup completed successfully. ${deletedCount} expired records removed.`,
      deletedCount 
    });
  } catch (error) {
    console.error('[Cleanup Route] Error triggering cleanup:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal Server Error during cleanup.' 
    }, { status: 500 });
  }
}
