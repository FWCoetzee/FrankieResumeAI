
'use client';

import { useUser } from "@/firebase/provider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { History, Loader2, ServerCrash, FileText, ArrowRight, Trash2 } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useResumeStore } from "@/hooks/use-resume-store";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/lib/auth-fetch";

type ResumeListItem = {
    resumeId: number;
    title: string;
    templateId: string;
    state: string;
    updatedAt: string;
}

const HistoryItem = ({ resume, onSelect, onDelete }: { resume: ResumeListItem, onSelect: (id: number) => void, onDelete: (id: number) => void }) => {
  const [deleteCandidate, setDeleteCandidate] = useState<number | null>(null);

  const handleConfirmDelete = () => {
    if (deleteCandidate) {
        onDelete(deleteCandidate);
    }
    setDeleteCandidate(null);
  }

  const updatedAt = resume.updatedAt ? new Date(resume.updatedAt as any) : new Date();

  return (
    <>
      <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume for "{resume.title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
        <div className="space-y-1">
          <p className="font-semibold">{resume.title}</p>
          <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
              {updatedAt && <span>Updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>}
              <Badge variant="outline">{resume.templateId}</Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteCandidate(resume.resumeId)}>
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
          </Button>
          <Button size="sm" onClick={() => onSelect(resume.resumeId)}>
              Load <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export function ResumeHistory() {
  const { isUserLoading } = useUser();
  const [resumes, setResumes] = useState<ResumeListItem[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const fetchResumes = async () => {
      setIsLoading(true);
      setError(null);
      try {
          const response = await authFetch('/api/resumes');
          if (!response.ok) {
              throw new Error("Could not fetch resume history.");
          }
          const data = await response.json();
          setResumes(data);
      } catch (err: any) {
          setError(err);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }

    fetchResumes();
  }, [isUserLoading]);

  const handleSelectResume = async (resumeId: number) => {
    try {
        const response = await authFetch(`/api/resumes/${resumeId}`);
        if (!response.ok) {
            throw new Error("Failed to fetch resume details.");
        }
        const fullResumeData = await response.json();
        setCurrentResume(fullResumeData);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        toast({
            title: "Resume Loaded",
            description: "The selected resume data has been loaded into the form.",
        });
    } catch (error) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load the selected resume.",
        });
    }
  }

  const handleDeleteResume = async (resumeId: number) => {
    try {
        const response = await authFetch(`/api/resumes/${resumeId}`, {
            method: 'DELETE'
        });
        if (!response.ok) {
            throw new Error("Failed to delete resume.");
        }
        toast({
            title: "Resume Deleted",
            description: "The resume has been successfully removed.",
        });
        // Refresh the list after deletion
        fetchResumes(); 
    } catch(error) {
         toast({
            variant: "destructive",
            title: "Error",
            description: "Could not delete the selected resume.",
        });
    }
  }

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="text-center text-muted-foreground p-8 flex items-center justify-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p>Loading resume history...</p>
        </div>
      );
    }

    if (error) {
       return (
         <div className="text-center text-destructive p-8">
            <ServerCrash className="mx-auto h-8 w-8 mb-2" />
            <p>Could not load resume history.</p>
            <p className="text-sm">{error.message}</p>
        </div>
       );
    }

    if (!resumes || resumes.length === 0) {
      return (
        <div className="text-center text-muted-foreground p-8">
            <FileText className="mx-auto h-8 w-8 mb-2" />
            <p>No resume history found.</p>
            <p className="text-sm">Generate a resume to see its history here.</p>
        </div>
      );
    }

    return (
        <div className="space-y-2">
            {resumes.map(resume => (
                <HistoryItem key={resume.resumeId} resume={resume} onSelect={handleSelectResume} onDelete={handleDeleteResume} />
            ))}
        </div>
    );
  };

  return (
    <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6" />
                Resume History
            </CardTitle>
            <CardDescription>
                Your previously generated resumes are saved here. Load one to edit or delete it.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  )
}
