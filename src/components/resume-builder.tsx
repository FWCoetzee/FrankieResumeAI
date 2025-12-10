
"use client";

import { useState } from "react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { generateResumeAction } from "@/app/actions";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/firebase";
import { ResumeHistory } from "./resume-history";
import { deleteResumeDataClient } from "@/lib/client-firestore";
import { getFirestore } from "firebase/firestore";
import { initializeFirebase } from "@/firebase";
import { set } from "lodash";

type GenerationResult = {
  resume: GeneratedResumeData;
  suggestions: string;
  coverLetter: string;
};

export function ResumeBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [currentResume, setCurrentResume] = useState<ResumeData | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useUser();

  const handleDataForReview = (data: ResumeData) => {
    // When submitting the form, we only have form data.
    // Preserve the id from the currently loaded resume if it exists.
    setCurrentResume(prev => ({
        ...data,
        id: prev?.id, // Keep the existing ID
    }));
    setResult(null); // Clear previous results
    setIsReviewing(true);
  };
  
  const handleGenerate = async (data: ResumeData) => {
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Not Logged In',
            description: 'Please log in to generate and save your resume.',
        });
        return;
    }
    
    setIsLoading(true);
    setCurrentResume(data); // Also update data on final generation
    setIsReviewing(false); // Move away from review screen to show loading state
    setResult(null);
    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });

    // Pass the user.uid and the current resume's ID (if it exists) to the action
    const response = await generateResumeAction(user.uid, data.id ?? null, data);

    if (response.error || !response.resume || !response.suggestions || !response.coverLetter) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: response.error || "An unknown error occurred. Please check your input and try again.",
      });
    } else {
      setResult({
        resume: response.resume,
        suggestions: response.suggestions,
        coverLetter: response.coverLetter,
      });
      toast({
        title: "Success!",
        description: data.id ? "Your resume has been updated." : "Your new resume has been saved and generated.",
      });
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsReviewing(false);
    setResult(null);
  };

  const handleAcceptEdit = (fieldPath: string, newValue: string) => {
    if (!result) return;
  
    setResult(prevResult => {
      if (!prevResult) return null;
      
      // Use lodash's set to safely update the nested property
      const newResume = { ...prevResult.resume };
      set(newResume, fieldPath, newValue);
      
      return {
        ...prevResult,
        resume: newResume,
      };
    });
    toast({
        title: "Content Updated",
        description: "Your resume has been updated with the AI's suggestion.",
    })
  };

  const handleLoadResume = (data: ResumeData) => {
    setCurrentResume(data); // This now includes the ID
    setIsReviewing(false);
    setResult(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    toast({
        title: "Resume Loaded",
        description: "The selected resume data has been loaded into the form.",
    });
  }

  const handleDeleteResume = (resumeId: string) => {
    if (!user) return;
    const { firestore } = initializeFirebase();
    deleteResumeDataClient(firestore, user.uid, resumeId);
    
    // If the deleted resume is the one currently in the form, clear it
    if (currentResume?.id === resumeId) {
        setCurrentResume(null);
    }
    
    toast({
        title: "Resume Deleted",
        description: "The selected resume has been removed from your history.",
    });
  }

  // On mobile, we only show one component at a time.
  // The logic is: show the form and history, UNLESS we are reviewing or showing a result.
  if (isMobile) {
     if (isReviewing || result) {
      return (
         <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={currentResume} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      )
     }
     return (
        <div className="space-y-8">
            <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} initialData={currentResume} />
            <ResumeHistory onSelectResume={handleLoadResume} onDeleteResume={handleDeleteResume} />
        </div>
     );
  }

  // On desktop, we show both side-by-side.
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8">
        <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} initialData={currentResume} />
        <ResumeHistory onSelectResume={handleLoadResume} onDeleteResume={handleDeleteResume} />
      </div>
      <div className="lg:sticky top-24">
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={currentResume} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      </div>
    </div>
  );
}
