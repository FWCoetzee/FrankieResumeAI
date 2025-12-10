
'use client';

import { useUser } from "@/firebase";
import { ResumeHistory } from "./resume-history";
import { Button } from "./ui/button";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { FilePlus } from "lucide-react";
import Link from "next/link";

// For now, these actions are placeholders.
// In a real app, you'd have dedicated functions to load/delete.
const handleLoadResume = (data: any) => {
    // This would likely navigate to the builder with the selected resume's data
    console.log("Loading resume:", data.id);
};

const handleDeleteResume = (id: string) => {
    console.log("Deleting resume:", id);
};


export function DashboardPage() {
    const { user } = useUser();
    const router = useRouter();
    const { toast } = useToast();

    const handleSelectResume = (data: any) => {
        // For now, just navigate to the main builder page.
        // A more advanced implementation would pass the resume ID or data.
        router.push('/');
        toast({
            title: "Resume Loaded",
            description: "The resume data has been loaded into the builder.",
        });
    };

    const handleDelete = (id: string) => {
        // This is where you would call the actual delete logic.
        // For this example, we'll just show a toast.
        toast({
            title: "Resume Deleted",
            description: `Resume with ID ${id} has been removed.`,
        });
    }

    return (
        <div className="container mx-auto px-4 py-8 md:py-12">
            <div className="flex flex-col sm:flex-row justify-between items-start mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold">Welcome back, {user?.displayName || 'builder'}!</h1>
                    <p className="text-muted-foreground mt-1">Here are your saved resumes. You can load an existing one or start a new one.</p>
                </div>
                <Link href="/#resume-builder">
                    <Button size="lg" className="w-full sm:w-auto">
                        <FilePlus className="mr-2 h-5 w-5"/>
                        Create New Resume
                    </Button>
                </Link>
            </div>
            
            {/* The ResumeHistory component now becomes the main content of the dashboard */}
            <ResumeHistory onSelectResume={handleSelectResume} onDeleteResume={handleDelete} />
        </div>
    );
}
