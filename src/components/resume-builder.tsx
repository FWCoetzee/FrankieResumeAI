
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
import { set, cloneDeep } from "lodash";
import { useResumeStore } from "@/hooks/use-resume-store";
import { useEffect } from "react";
import { AuthDialog } from "./auth-dialog";

type GenerationResult = {
  resume: GeneratedResumeData;
  suggestions: string;
  coverLetter: string;
};

export function ResumeBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useUser();
  const { currentResume, setCurrentResume, formActionData, setFormActionData } = useResumeStore();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const handleDataForReview = (data: ResumeData) => {
    // When submitting the form, we only have form data.
    // Preserve the id from the currently loaded resume if it exists.
    setFormActionData({
      ...data,
      id: currentResume?.id, // Keep the existing ID
    });
    setResult(null); // Clear previous results
    setIsReviewing(true);
  };
  
  const handleGenerate = async (data: ResumeData) => {
    if (!user) {
        setAuthDialogOpen(true);
        return;
    }
    
    setIsLoading(true);
    // Set the state that is actually being generated
    setFormActionData(data); 
    setIsReviewing(false); // Move away from review screen to show loading state
    setResult(null);
    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });

    const response = await generateResumeAction(user.uid, data.id ?? null, data);

    if (response.error || !response.resume || !response.suggestions || !response.coverLetter) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: response.error || "An unknown error occurred. Please check your input and try again.",
      });
      // On failure, revert to the review screen with the data that was sent.
      setIsReviewing(true);
    } else {
      setResult({
        resume: response.resume,
        suggestions: response.suggestions,
        coverLetter: response.coverLetter,
      });
      // On success, we update the main `currentResume` with the data that was just saved.
      // This ensures the form is now in sync with the saved version.
      setCurrentResume(data);
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
    if (!result || !formActionData) return;
  
    setResult(prevResult => {
      if (!prevResult) return null;
      
      const newResume = cloneDeep(prevResult.resume);
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

  // On mobile, we only show one component at a time.
  // The logic is: show the form, UNLESS we are reviewing or showing a result.
  if (isMobile) {
     if (isReviewing || result) {
      return (
         <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={formActionData} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      )
     }
     return (
        <div className="space-y-8 print-hidden">
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
            <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} />
            {user && <ResumeHistory />}
        </div>
     );
  }

  // On desktop, we show both side-by-side.
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <div className="space-y-8 print-hidden">
        <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} />
        {user && <ResumeHistory />}
      </div>
      <div className="lg:sticky top-24">
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={formActionData} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      </div>
    </div>
  );
}
