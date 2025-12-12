
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { History, Loader2, ServerCrash, FileText, ArrowRight, Trash2 } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "./ui/badge";
import { useState } from "react";
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
import { initializeFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";

// Firestore documents have Timestamps
type FirestoreResumeData = Omit<ResumeData, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const HistoryItem = ({ resume, onDeleteClick }: { resume: FirestoreResumeData, onDeleteClick: () => void }) => {
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const handleSelect = () => {
    const formData: ResumeData = {
        ...resume,
        createdAt: resume.createdAt.toDate().toISOString(),
        updatedAt: resume.updatedAt.toDate().toISOString(),
    };
    setCurrentResume(formData);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
        title: "Resume Loaded",
        description: "The selected resume data has been loaded into the form.",
    });
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="space-y-1">
        <p className="font-semibold">{resume.target_job_title}</p>
        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>Updated {formatDistanceToNow(resume.updatedAt.toDate(), { addSuffix: true })}</span>
            <Badge variant="outline">{resume.experience_level}</Badge>
            <Badge variant="outline">{resume.resume_style}</Badge>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity" onClick={onDeleteClick}>
            <Trash2 className="h-4 w-4 text-destructive" />
            <span className="sr-only">Delete</span>
        </Button>
        <Button variant="outline" size="sm" onClick={handleSelect}>
            Load <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function ResumeHistory() {
  const { user } = useUser();
  const firestore = useFirestore();
  const [deleteCandidate, setDeleteCandidate] = useState<FirestoreResumeData | null>(null);
  const { clearCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const resumesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'resumeData'),
      orderBy('updatedAt', 'desc')
    );
  }, [user, firestore]);
  
  const { data: resumes, isLoading, error } = useCollection<FirestoreResumeData>(resumesQuery);

  const handleConfirmDelete = () => {
    if (deleteCandidate?.id && user?.uid) {
        const { firestore } = initializeFirebase();
        deleteResumeDataClient(firestore, user.uid, deleteCandidate.id);
        
        clearCurrentResume(deleteCandidate.id);
        
        toast({
            title: "Resume Deleted",
            description: "The resume has been successfully removed.",
        });
    }
    setDeleteCandidate(null);
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

    if (!user) {
        return (
             <div className="text-center text-muted-foreground p-8">
                <FileText className="mx-auto h-8 w-8 mb-2" />
                <p>Log in to see your resume history.</p>
            </div>
        )
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
                <HistoryItem key={resume.id} resume={resume} onDeleteClick={() => setDeleteCandidate(resume)} />
            ))}
        </div>
    );
  };

  return (
    <>
    <AlertDialog open={!!deleteCandidate} onOpenChange={(open) => !open && setDeleteCandidate(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the resume for "{deleteCandidate?.target_job_title}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
    </>
  )
}
