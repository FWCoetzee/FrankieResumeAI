
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/firebase';
import { LandingPage } from "@/components/landing-page";
import { OnboardingFlow } from "@/components/onboarding-flow";
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If the user status is resolved and a user exists, redirect to dashboard.
    if (!isUserLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isUserLoading, router]);

  // While checking for user, show a loading skeleton or a blank page to prevent flicker.
  if (isUserLoading || user) {
    return (
      <div className="container mx-auto px-4 py-16 md:py-24 space-y-12">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }
  
  // If no user is logged in, show the public landing page.
  return (
    <>
      <LandingPage />
      <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Create Your Resume</h2>
        <OnboardingFlow />
      </div>
    </>
  );
}
