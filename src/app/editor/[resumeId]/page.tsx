
'use client';

import { ResumeBuilder } from "@/components/resume-builder"; 
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useUser } from '@/firebase';
import { useParams } from 'next/navigation';
import { useResumeStore } from "@/hooks/use-resume-store";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function EditorPage() {
    const { user, isUserLoading } = useUser();
    const params = useParams();
    const { setCurrentResume, clearCurrentResume } = useResumeStore();

    const resumeId = params.resumeId as string;

    useEffect(() => {
        // When the route is for a new resume, clear any existing resume data from the store.
        // This ensures the form starts fresh.
        if (resumeId === 'new') {
            clearCurrentResume();
        }
        // In a real app, if resumeId is not 'new', you would fetch the specific resume data here.
    }, [resumeId, clearCurrentResume]);

    if (isUserLoading) {
        return (
            <div className="container mx-auto px-4 py-12 md:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-start">
                    <div className="space-y-8 print-hidden">
                         <Skeleton className="h-48 w-full" />
                         <Skeleton className="h-96 w-full" />
                    </div>
                    <div className="lg:sticky top-24">
                        <Skeleton className="h-[500px] lg:h-[calc(100vh-8rem)] w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        // For logged-out users, show the onboarding flow which leads to the form.
        // This is the intended path for new, unauthenticated visitors.
        return (
            <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Create Your Resume</h2>
                <OnboardingFlow />
            </div>
        )
    }

    // For logged-in users (whether creating 'new' or editing), show the full resume builder directly.
    return (
        <div id="resume-builder" className="container mx-auto px-4 py-12 md:py-16">
            <ResumeBuilder />
        </div>
    );
}
