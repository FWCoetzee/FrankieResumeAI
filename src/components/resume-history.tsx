
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
import { useResumeStore } from "@/hooks/use-resume-store";
import { deleteResumeDataClient } from "@/lib/client-firestore";
import { useToast } from "@/hooks/use-toast";
import { FirestorePermissionError } from "@/firebase/errors";
import { errorEmitter } from "@/firebase/error-emitter";

// This type represents the data structure as it comes from Firestore, with Timestamps.
// It's defined to handle the nested structure correctly.
type FirestoreResumeDoc = Omit<ResumeData, 'createdAt' | 'updatedAt' | 'sections'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sections: Omit<ResumeData['sections'], 'summary' | 'experience'> & {
    summary: Omit<ResumeData['sections']['summary'], 'lastEdited'> & {
      lastEdited: Timestamp;
    };
    experience: Array<
      Omit<ResumeData['sections']['experience'][0], 'startDate' | 'endDate'> & {
        startDate: Timestamp;
        endDate: Timestamp | null;
      }
    >;
  };
};

// This is the type we will use inside the component, with native JS Date objects.
type ComponentResumeData = Omit<ResumeData, 'createdAt' | 'updatedAt' | 'sections'> & {
  id: string; 
  createdAt: Date;
  updatedAt: Date;
  sections: Omit<ResumeData['sections'], 'summary' | 'experience'> & {
    summary: Omit<ResumeData['sections']['summary'], 'lastEdited'> & {
      lastEdited: Date;
    };
    experience: Array<
      Omit<ResumeData['sections']['experience'][0], 'startDate' | 'endDate'> & {
        startDate: Date;
        endDate: Date | null;
      }
    >;
  };
};


const HistoryItem = ({ resume, onDeleteClick }: { resume: ComponentResumeData, onDeleteClick: () => void }) => {
  const { setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const handleSelect = () => {
    // Convert Dates back to ISO strings for our app's internal schema (ResumeData)
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
            {/* formatDistanceToNow works correctly with Date objects */}
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
  const { clearCurrentResume } = useResumeStore();
  const { toast } = useToast();
  
  const [resumes, setResumes] = useState<ComponentResumeData[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | Error | null>(null);

  useEffect(() => {
    if (isUserLoading) {
      setIsLoading(true);
      return;
    }
    if (!user) {
      setIsLoading(false);
      setResumes(null);
      setError(null);
      return;
    }

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
        const results: ComponentResumeData[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data() as FirestoreResumeDoc;
          
          // ** THE FIX IS HERE **: Recursively convert all Timestamps to JS Dates
          const componentData: ComponentResumeData = {
            ...data,
            id: doc.id,
            createdAt: data.createdAt.toDate(),
            updatedAt: data.updatedAt.toDate(),
            sections: {
              ...data.sections,
              summary: {
                ...data.sections.summary,
                lastEdited: data.sections.summary.lastEdited.toDate(),
              },
              experience: data.sections.experience.map(exp => ({
                ...exp,
                startDate: exp.startDate.toDate(),
                endDate: exp.endDate ? exp.endDate.toDate() : null,
              })),
            },
          };
          results.push(componentData);
        });
        setResumes(results);
        setError(null);
        setIsLoading(false);
      },
      (err: FirestoreError) => {
        console.error("ResumeHistory subscription error:", err);
        const contextualError = new FirestorePermissionError({
          operation: 'list',
          path: 'resumes',
        });
        setError(contextualError);
        setResumes(null);
        setIsLoading(false);
        errorEmitter.emit('permission-error', contextualError);
      }
    );

    // Cleanup subscription on unmount or if user changes
    return () => unsubscribe();
  }, [user, firestore, isUserLoading]);


  const handleConfirmDelete = () => {
    if (deleteCandidate?.id) {
        deleteResumeDataClient(deleteCandidate.id);
        
        clearCurrentResume(deleteCandidate.id);
        
        toast({
            title: "Resume Deleted",
            description: "The resume has been successfully removed.",
        });
    }
    setDeleteCandidate(null);
  }

  const renderContent = () => {
    if (isLoading || isUserLoading) {
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
