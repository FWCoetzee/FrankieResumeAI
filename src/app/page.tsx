
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LandingPage } from "@/components/landing-page";
import { ResumeBuilder } from "@/components/resume-builder"; 
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If we're still checking for a user, don't do anything yet.
    if (isUserLoading) {
      return;
    }

    // If a user is logged in, redirect them to the dashboard.
    if (user) {
        router.replace('/dashboard');
        return;
    }
    
  }, [user, isUserLoading, router]);

  // While checking for user on initial load, show a loading skeleton.
  if (isUserLoading || user) { // Also show skeleton during the brief moment before redirect
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 space-y-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // If no user is logged in, show the public landing page with the builder.
  return (
    <>
      <LandingPage />
      <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Create Your Resume</h2>
        <ResumeBuilder />
      </div>
    </>
  );
}
