
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, Timestamp } from "firebase/firestore";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { History, Loader2, ServerCrash, FileText, ArrowRight } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { formatDistanceToNow } from 'date-fns';
import { Badge } from "./ui/badge";

type FirestoreResumeData = Omit<ResumeData, 'createdAt' | 'updatedAt'> & {
  id: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

interface ResumeHistoryProps {
    onSelectResume: (data: ResumeData) => void;
}


const HistoryItem = ({ resume, onSelectResume }: { resume: FirestoreResumeData, onSelectResume: (data: ResumeData) => void }) => {
  const handleSelect = () => {
    // Convert Timestamps back to strings or whatever format your form expects.
    // This is a placeholder; you might need a more robust conversion.
    const formData = {
        ...resume,
        createdAt: resume.createdAt.toDate().toISOString(),
        updatedAt: resume.updatedAt.toDate().toISOString(),
    } as unknown as ResumeData;
    onSelectResume(formData);
  }

  return (
    <div className="flex items-center justify-between p-4 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="space-y-1">
        <p className="font-semibold">{resume.target_job_title}</p>
        <div className="text-sm text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>Generated {formatDistanceToNow(resume.createdAt.toDate(), { addSuffix: true })}</span>
            <Badge variant="outline">{resume.experience_level}</Badge>
            <Badge variant="outline">{resume.resume_style}</Badge>
        </div>
      </div>
       <Button variant="outline" size="sm" onClick={handleSelect}>
        Load <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )
}

export function ResumeHistory({ onSelectResume }: ResumeHistoryProps) {
  const { user } = useUser();
  const firestore = useFirestore();

  const resumesQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return query(
      collection(firestore, 'users', user.uid, 'resumeData'),
      orderBy('createdAt', 'desc')
    );
  }, [user, firestore]);
  
  const { data: resumes, isLoading, error } = useCollection<FirestoreResumeData>(resumesQuery);

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
                <HistoryItem key={resume.id} resume={resume} onSelectResume={onSelectResume} />
            ))}
        </div>
    );
  };

  return (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6" />
                Resume History
            </CardTitle>
            <CardDescription>
                Your previously generated resumes are saved here. Load one to edit it.
            </CardDescription>
        </CardHeader>
        <CardContent>
            {renderContent()}
        </CardContent>
    </Card>
  )
}
