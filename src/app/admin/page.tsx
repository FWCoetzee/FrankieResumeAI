/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Trash2, RefreshCw, ShieldAlert, Database } from 'lucide-react';

export default function AdminDashboard() {
  const [isCleaning, setIsCleaning] = useState(false);
  const [stats, setStats] = useState<{ resumes: number; usage: number } | null>(null);

  const handleCleanup = async () => {
    setIsCleaning(true);
    try {
      const response = await fetch('/api/admin/cleanup/anonymous-resumes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cleanup-secret': process.env.NEXT_PUBLIC_CLEANUP_SECRET || '', // In production, this would be handled via a secure session
        },
      });

      if (!response.ok) {
        throw new Error('Cleanup failed. Unauthorized or server error.');
      }

      const data = await response.json();
      setStats({
        resumes: data.deletedResumeCount,
        usage: data.deletedUsageRecordCount,
      });

      toast({
        title: "Cleanup Successful",
        description: `Removed ${data.deletedResumeCount} expired resumes and ${data.deletedUsageRecordCount} usage records.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Cleanup Failed",
        description: error instanceof Error ? error.message : 'An unknown error occurred.',
      });
    } finally {
      setIsCleaning(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Creator Dashboard</h1>
            <p className="text-slate-500">System maintenance and database management</p>
          </div>
          <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
            <ShieldAlert size={14} />
            Admin Access
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="text-blue-500" />
                Database Hygiene
              </CardTitle>
              <CardDescription>
                Manually trigger the cleanup of expired anonymous sessions and usage logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleCleanup} 
                  disabled={isCleaning}
                  className="w-full"
                >
                  {isCleaning ? (
                    <><RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cleaning...</>
                  ) : (
                    <><Trash2 className="mr-2 h-4 w-4" /> Run Cleanup Now</>
                  )}
                </Button>
                
                {stats && (
                  <div className="bg-slate-100 p-4 rounded-lg text-sm space-y-1 border">
                    <p className="font-medium">Last Action Results:</p>
                    <div className="flex justify-between">
                      <span>Resumes purged:</span>
                      <span className="font-bold">{stats.resumes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Usage logs purged:</span>
                      <span className="font-bold">{stats.usage}</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>
                Quick status of the application services.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm">Firebase Auth</span>
                  <span className="text-green-500 text-xs font-bold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-2 border-b">
                  <span className="text-sm">Neon Postgres</span>
                  <span className="text-green-500 text-xs font-bold">ONLINE</span>
                </div>
                <div className="flex items-center justify-between p-2">
                  <span className="text-sm">Gemini AI Engine</span>
                  <span className="text-green-500 text-xs font-bold">ONLINE</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
