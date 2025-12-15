
'use client';

import { useUser, useFirestore } from "@/firebase";
import { collection, query, where, orderBy, Timestamp, onSnapshot, QuerySnapshot, DocumentData, FirestoreError } from "firebase/firestore";
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
import { useResumeStore, createNewBlankResume } from "@/hooks/use-resume-store";
import { deleteResumeDataClient } from "@/lib/client-firestore";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

type ComponentResumeData = Omit<ResumeData, 'createdAt' | 'updatedAt' | 'sections'> & {
  id: string; 
  createdAt: Date;
  updatedAt: Date;
  sections: Omit<ResumeData['sections'], 'summary' | 'experience' | 'education'> & {
    summary: Omit<ResumeData['sections']['summary'], 'lastEdited'> & {
      lastEdited: Date;
    };
    experience: Array<
      Omit<ResumeData['sections']['experience'][0], 'startDate' | 'endDate'> & {
        startDate: Date;
        endDate: Date | null;
      }
    >;
    education: any[];
  };
};

const toDate = (timestamp: Timestamp | string | Date | null | undefined): Date | null => {
    if (!timestamp) return null;
    if (timestamp instanceof Date) return timestamp;
    if (timestamp instanceof Timestamp) return timestamp.toDate();
    if (typeof timestamp === 'string') return new Date(timestamp);
    return null;
}

const HistoryItem = ({ resume, onDeleteClick }: { resume: ComponentResumeData, onDeleteClick: () => void }) => {
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const handleSelect = () => {
    const resumeForStore: ResumeData = {
        ...resume,
        createdAt: resume.createdAt.toISOString(),
        updatedAt: resume.updatedAt.toISOString(),
        sections: {
          ...resume.sections,
          summary: {
            ...resume.sections.summary,
            lastEdited: resume.sections.summary.lastEdited.toISOString(),
          },
          experience: resume.sections.experience.map(exp => ({
            ...exp,
            startDate: exp.startDate.toISOString(),
            endDate: exp.endDate ? exp.endDate.toISOString() : null,
          })),
        }
    };
    setCurrentResume(resumeForStore);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
        title: "Resume Loaded",
        description: "The selected resume data has been loaded into the form.",
    });
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors group">
      <div className="space-y-1">
        <p className="font-semibold">{resume.title}</p>
        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>Updated {formatDistanceToNow(resume.updatedAt, { addSuffix: true })}</span>
            <Badge variant="outline">{resume.templateId}</Badge>
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
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [deleteCandidate, setDeleteCandidate] = useState<ComponentResumeData | null>(null);
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();
  
  const [resumes, setResumes] = useState<ComponentResumeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    // If the initial user check is still running, do nothing yet.
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    
    // If there is no user, clear the state and stop.
    if (!user) {
      setIsLoading(false);
      setResumes(null); // Clear any existing data
      setError(null);
      // Ensure the form is cleared as well by setting a new blank resume
      setCurrentResume(createNewBlankResume(''));
      return;
    }

    // At this point, we have a valid, authenticated user.
    setIsLoading(true);

    const q = query(
      collection(firestore, 'resumes'),
      where('ownerId', '==', user.uid),
      where('isDeleted', '==', false),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const results: ComponentResumeData[] = snapshot.docs.map(doc => {
          const data = doc.data();

          return {
            ...data,
            id: doc.id,
            createdAt: toDate(data.createdAt)!,
            updatedAt: toDate(data.updatedAt)!,
            sections: {
              ...data.sections,
              summary: {
                ...data.sections.summary,
                lastEdited: toDate(data.sections.summary.lastEdited)!,
              },
              experience: (data.sections.experience || []).map((exp: any) => ({
                ...exp,
                startDate: toDate(exp.startDate)!,
                endDate: toDate(exp.endDate),
              })),
              education: data.sections.education || [],
            },
          } as ComponentResumeData;
        });

        setResumes(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("ResumeHistory subscription error:", err);
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: `resumes where ownerId == ${user.uid}`,
        });
        setError(contextualError);
        setResumes(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup function to unsubscribe from the listener when the component unmounts
    // or when the user's auth state changes.
    return () => unsubscribe();
  }, [user, firestore, isUserLoading, setCurrentResume]);


  const handleConfirmDelete = () => {
    if (deleteCandidate?.id && user) {
        deleteResumeDataClient(user.uid, deleteCandidate.id);
        
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
              This action cannot be undone. This will permanently delete the resume for "{deleteCandidate?.title}".
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
