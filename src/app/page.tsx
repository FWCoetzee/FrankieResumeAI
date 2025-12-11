
'use client';

import { useUser } from '@/firebase';
import { LandingPage } from "@/components/landing-page";
import { ResumeBuilder } from "@/components/resume-builder"; 
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();

  // While checking for user on initial load, show a loading skeleton.
  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 space-y-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // If a user is logged in, show them the resume builder directly.
  if (user) {
    return (
      <div id="resume-builder" className="container mx-auto px-4 py-12 md:py-16">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Create Your Resume</h2>
        <ResumeBuilder />
      </div>
    );
  }

  // If no user is logged in, show the public landing page with the builder below the fold.
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
