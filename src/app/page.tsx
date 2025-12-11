
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
    
    // If the user is logged in, but somehow landed on the root page with an anchor,
    // it's likely from an old link. Redirect them to the dashboard for a better experience.
    if (user && window.location.hash) {
      router.replace('/dashboard');
      return;
    }

    // If there's no user and no hash, they're a new visitor.
    // The component will render the landing page and builder.
    
  }, [user, isUserLoading, router]);

  // While checking for user on initial load, show a loading skeleton.
  if (isUserLoading) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 space-y-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // For both logged-in users and anonymous visitors, show the main builder view.
  // The landing page elements will be shown for non-logged-in users.
  if (user) {
    return (
       <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Resume Studio</h2>
        <ResumeBuilder />
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
