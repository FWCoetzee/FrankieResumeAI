
'use client';

import { useUser } from '@/firebase';
import { LandingPage } from "@/components/landing-page";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const { user, isUserLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    // If user is loaded and logged in, redirect to the dashboard.
    if (!isUserLoading && user) {
      router.replace('/app/dashboard');
    }
  }, [user, isUserLoading, router]);

  // While checking for user on initial load, show a loading skeleton.
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
    </>
  );
}
