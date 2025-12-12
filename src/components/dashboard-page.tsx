
'use client';

import { useUser } from "@/firebase";
import { ResumeHistory } from "./resume-history";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FilePlus } from "lucide-react";
import Link from "next/link";
import { useResumeStore } from "@/hooks/use-resume-store";

export function DashboardPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();
    const { clearCurrentResume } = useResumeStore();

    const handleCreateNew = () => {
        clearCurrentResume();
        router.push('/editor/new');
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || 'builder'}!</h1>
                    <p className="text-muted-foreground mt-1">Here are your saved resumes. You can load one to edit it, or start fresh.</p>
                </div>
                <Button size="lg" className="w-full sm:w-auto" onClick={handleCreateNew}>
                    <FilePlus className="mr-2 h-5 w-5"/>
                    Create New Resume
                </Button>
            </div>
            
            {/* The ResumeHistory component is the main content of the dashboard */}
            <ResumeHistory />
        </div>
    );
}
