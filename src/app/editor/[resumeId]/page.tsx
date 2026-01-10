
'use client';

import { ResumeBuilder } from "@/components/resume-builder"; 
import { useUser } from '@/firebase';
import { useParams, useRouter } from 'next/navigation';
import { useResumeStore } from "@/hooks/use-resume-store";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { authFetch } from "@/lib/auth-fetch";

export default function EditorPage() {
    const { user, isUserLoading } = useUser();
    const params = useParams();
    const router = useRouter();
    const { setCurrentResume, clearCurrentResume } = useResumeStore();
    const [isLoading, setIsLoading] = useState(true);

    const resumeId = params.resumeId as string;

    useEffect(() => {
        const loadResume = async () => {
            if (isUserLoading) return; // Wait for user status to be resolved
            
            setIsLoading(true);

            if (resumeId === 'new') {
                clearCurrentResume();
            } else {
                if (user) { // Only fetch if user is logged in
                    try {
                        const response = await authFetch(`/api/resumes/${resumeId}`);
                        if (response.ok) {
                            const data = await response.json();
                            setCurrentResume(data);
                        } else {
                            console.error(`Failed to fetch resume ${resumeId}, status: ${response.status}`);
                            router.replace('/app/dashboard'); // Or a dedicated 404 page
                        }
                    } catch (error) {
                        console.error('Error fetching resume:', error);
                        router.replace('/app/dashboard');
                    }
                } else {
                    // If not logged in and trying to access a specific resume, redirect
                    router.replace('/auth/login');
                }
            }
            setIsLoading(false);
        };

        loadResume();

    }, [resumeId, user, isUserLoading]);
    

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
