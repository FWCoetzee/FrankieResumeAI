
'use client';

import { ResumeBuilder } from "@/components/resume-builder"; 
import { OnboardingFlow } from "@/components/onboarding-flow";
import { useUser } from '@/firebase';
import { useParams } from 'next/navigation';
import { useResumeStore } from "@/hooks/use-resume-store";
import { useEffect } from "react";

export default function EditorPage() {
    const { user, isUserLoading } = useUser();
    const params = useParams();
    const { setCurrentResume } = useResumeStore();

    const resumeId = params.resumeId as string;

    useEffect(() => {
        // This is a simplified way to handle loading a resume.
        // In a real app, you would fetch the resume data using the resumeId.
        // For now, if the ID is not 'new', we assume we are editing and might need to load data.
        // If the ID is 'new', we clear any existing resume from the store.
        if (resumeId === 'new') {
            setCurrentResume(null);
        }
    }, [resumeId, setCurrentResume]);

    if (isUserLoading) {
        return <div className="container mx-auto px-4 py-12 md:py-16">Loading...</div>
    }

    if (!user) {
        // For logged-out users, show the onboarding flow which leads to the form.
        return (
            <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
                <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Create Your Resume</h2>
                <OnboardingFlow />
            </div>
        )
    }

    // For logged-in users, show the full resume builder.
    return (
        <div id="resume-builder" className="container mx-auto px-4 py-12 md:py-16">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Resume Editor</h2>
            <ResumeBuilder />
        </div>
    );
}
