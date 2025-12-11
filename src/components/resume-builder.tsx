
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

  // When form is submitted, data goes into `formActionData` for review.
  // We preserve the `id` from the loaded resume if it exists.
  useEffect(() => {
    if (currentResume) {
        setFormActionData({
            ...currentResume,
        });
    }
  }, [currentResume, setFormActionData]);

  const handleDataForReview = (data: ResumeData) => {
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
    setFormActionData(data); // The data being sent to the AI
    setIsReviewing(false); 
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
      setIsReviewing(true);
    } else {
      setResult({
        resume: response.resume,
        suggestions: response.suggestions,
        coverLetter: response.coverLetter,
      });
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

      // Use lodash.cloneDeep to create a new object to avoid direct mutation
      const newResult = cloneDeep(prevResult);

      // Use lodash.set to safely update the nested property
      set(newResult, fieldPath, newValue);
      
      return newResult;
    });
  
    toast({
        title: "Content Updated",
        description: "Your document has been updated with the AI's suggestion.",
    })
  };

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
