
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
import { deleteResumeDataClient } from "@/lib/client-firestore";
import { useToast } from "@/hooks/use-toast";
import { useFirestore } from "@/firebase";
import { collection, query, where, onSnapshot, orderBy, Timestamp } from "firebase/firestore";

const HistoryItem = ({ resume }: { resume: ResumeData & { id: string } }) => {
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();
  const [deleteCandidate, setDeleteCandidate] = useState<string | null>(null);
  const { user } = useUser();

  const handleSelect = () => {
    // Convert all Timestamp objects back to ISO strings for form compatibility
    const resumeForStore: ResumeData = {
        ...resume,
        createdAt: resume.createdAt ? new Date(resume.createdAt).toISOString() : new Date().toISOString(),
        updatedAt: resume.updatedAt ? new Date(resume.updatedAt).toISOString() : new Date().toISOString(),
        sections: {
            ...resume.sections,
            summary: {
                ...resume.sections.summary,
                lastEdited: resume.sections.summary.lastEdited ? new Date(resume.sections.summary.lastEdited).toISOString() : new Date().toISOString(),
            },
            experience: resume.sections.experience.map(exp => ({
                ...exp,
                startDate: exp.startDate ? new Date(exp.startDate).toISOString() : '',
                endDate: exp.endDate ? new Date(exp.endDate).toISOString() : null,
            }))
        }
    };
    setCurrentResume(resumeForStore);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
        title: "Resume Loaded",
        description: "The selected resume data has been loaded into the form.",
    });
  }
  
  const handleConfirmDelete = () => {
    if (deleteCandidate && user) {
        deleteResumeDataClient(user.uid, deleteCandidate);
        toast({
            title: "Resume Deleted",
            description: "The resume has been successfully removed.",
        });
    }
    setDeleteCandidate(null);
  }

  const updatedAt = resume.updatedAt ? new Date(resume.updatedAt) : null;

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
          <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setDeleteCandidate(resume.id)}>
              <Trash2 className="h-4 w-4 text-destructive" />
              <span className="sr-only">Delete</span>
          </Button>
          <Button variant="outline" size="sm" onClick={handleSelect}>
              Load <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  )
}

export function ResumeHistory() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [resumes, setResumes] = useState<(ResumeData & { id: string })[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    
    if (!user) {
      setResumes(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Correct path: /users/{userId}/resumes
    const resumesRef = collection(firestore, 'users', user.uid, 'resumes');
    const q = query(
      resumesRef, 
      where("isDeleted", "==", false),
      orderBy("updatedAt", "desc")
    );

    const unsubscribe = onSnapshot(q, 
      (querySnapshot) => {
        const resumesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            // Deep conversion of Timestamps to JS Dates
            const convertTimestamps = (obj: any): any => {
              if (obj instanceof Timestamp) {
                  return obj.toDate();
              }
              if (Array.isArray(obj)) {
                  return obj.map(convertTimestamps);
              }
              if (obj !== null && typeof obj === 'object') {
                  return Object.keys(obj).reduce((acc, key) => {
                      acc[key] = convertTimestamps(obj[key]);
                      return acc;
                  }, {} as { [key: string]: any });
              }
              return obj;
            };

            return { id: doc.id, ...convertTimestamps(data) } as ResumeData & { id: string };
        });
        setResumes(resumesData);
        setIsLoading(false);
      },
      (err) => {
        console.error("Firestore onSnapshot error:", err);
        setError(err);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user, isUserLoading, firestore]);

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
                <HistoryItem key={resume.id} resume={resume} />
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
