
'use client';

import { ResumeBuilder } from "@/components/resume-builder"; 
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useResumeStore } from "@/hooks/use-resume-store";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/lib/auth-fetch";
import { type ResumeFormData, type ResumeData } from "@/lib/schema";

export default function EditorPage() {
    const { user, isUserLoading } = useUser();
    const params = useParams();
    const router = useRouter();
    const { setCurrentResume, clearCurrentResume } = useResumeStore();
    const [isLoading, setIsLoading] = useState(true);

    const resumeId = params.resumeId as string;
    const ANONYMOUS_RESUME_STORAGE_KEY = 'anonymousResumeData';

    useEffect(() => {
        const loadResume = async () => {
            if (isUserLoading) return; // Wait for user status to be resolved
            
            setIsLoading(true);

            // After login, check for pending data from an anonymous session
            if (user) {
                const pendingData = localStorage.getItem(ANONYMOUS_RESUME_STORAGE_KEY);
                if (pendingData) {
                    try {
                        const parsedData: ResumeFormData = JSON.parse(pendingData);
                        
                        // We have data from a previous session. Load it into the store
                        // as a new, unsaved resume.
                        const newResume: Partial<ResumeData> = {
                            resumeId: 0, // Mark as new
                            title: parsedData.title,
                            templateId: parsedData.templateId || 'modern',
                            status: 'DRAFT',
                            fullName: parsedData.fullName || '',
                            email: parsedData.email || '',
                            website: parsedData.website || '',
                            sections: {
                                summary: { content: parsedData.sections.summary?.content || '', lastEdited: new Date().toISOString() },
                                experience: parsedData.sections.experience || [],
                                education: parsedData.sections.education || [],
                                skills: parsedData.sections.skills || [],
                                projects: parsedData.sections.projects || [],
                                certifications: parsedData.sections.certifications || [],
                                references: parsedData.sections.references || [],
                            }
                        };
                        setCurrentResume(newResume as ResumeData);
                        localStorage.removeItem(ANONYMOUS_RESUME_STORAGE_KEY);
                        
                        // The user is now on /editor/[someId], but we've loaded a new resume.
                        // Redirect to the clean /editor/new URL to prevent confusion.
                        router.replace('/editor/new');
                        setIsLoading(false);
                        return; // Stop further execution
                    } catch (e) {
                        console.error("Failed to parse pending resume data", e);
                        // Clear corrupted data
                        localStorage.removeItem(ANONYMOUS_RESUME_STORAGE_KEY);
                    }
                }
            }
            
            if (resumeId === 'new') {
                // If it's a new resume, just clear the store
                clearCurrentResume();
            } else {
                // For MVP, we will eventually fetch from Firestore using anonymous session ID
                // For now, if we don't have a user (which we don't for public), we might just clear or load from local storage
                clearCurrentResume();
            }
            setIsLoading(false);
        };

        loadResume();

    }, [resumeId, router, setCurrentResume, clearCurrentResume, isUserLoading, user]);
    

    if (isLoading) {
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
    
    return (
        <div id="resume-builder" className="container mx-auto px-4 py-12 md:py-16">
            <ResumeBuilder />
        </div>
    );
}
