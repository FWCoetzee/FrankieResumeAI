
"use client";

import { useState } from "react";
import type { ResumeData, GeneratedResumeData, ResumeFormData } from "@/lib/schema";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/firebase";
import { ResumeHistory } from "./resume-history";
import { set, cloneDeep } from "lodash";
import { useResumeStore } from "@/hooks/use-resume-store";
import { AuthDialog } from "./auth-dialog";
import { v4 as uuidv4 } from "uuid";

export function ResumeBuilder() {
  const { user } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  const {
    currentResume,
    setCurrentResume,
    result,
    isLoading,
    isReviewing,
    setFormForReview,
    setGenerationResult,
    setIsEditing,
    updateResult,
  } = useResumeStore();

  const handleGenerate = async (data: ResumeFormData) => {
    if (!user) {
      setAuthDialogOpen(true);
      // Persist form data to the store even if not logged in
      setFormForReview(data);
      return;
    }
    setFormForReview(data);
  };
  
  const handleConfirmGenerate = async () => {
    if (!user || !currentResume) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "You must be logged in and have resume data to generate.",
        });
        return;
    }
    
    // If the resume has no ID, it's a new one. Create it first.
    if (!currentResume.resumeId) {
        try {
            const createResponse = await fetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: currentResume.title }),
            });
            if (!createResponse.ok) throw new Error('Failed to create new resume project.');
            
            const { resumeId } = await createResponse.json();
            
            // Now, generate content for this new resume
            generateContentForResume(resumeId);

        } catch (error) {
            console.error("New Resume Creation Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Creation Failed", description: errorMessage });
        }
    } else {
        // It's an existing resume, just generate new content for it.
        generateContentForResume(currentResume.resumeId);
    }
  }

  const generateContentForResume = async (resumeId: number) => {
    if (!currentResume) return;

    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });

    try {
        const response = await fetch(`/api/resumes/${resumeId}/generate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeData: currentResume }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to generate resume.');
        }

        const generationResult = await response.json();

        toast({
            title: "Success!",
            description: "Your new AI-powered resume has been generated and saved.",
        });

        setGenerationResult({ ...generationResult, savedResumeId: resumeId });

    } catch (error) {
        console.error("AI Generation or API Error:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        toast({
            variant: "destructive",
            title: "Generation Failed",
            description: errorMessage,
        });
        setGenerationResult({ error: errorMessage });
    }
  }

  const handleAcceptEdit = (fieldPath: string, newValue: string | string[]) => {
    if (!result || !currentResume) return;
  
    const newResult = cloneDeep(result);
  
    set(newResult, fieldPath, newValue);
      
    updateResult(newResult);
  
    toast({
        title: "Content Updated",
        description: "Your document has been updated with the AI's suggestion.",
    });
  };

  if (isMobile) {
     if (isReviewing || result) {
      return (
         <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={currentResume} 
          isReviewing={isReviewing}
          onEdit={setIsEditing}
          onGenerate={handleConfirmGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      )
     }
     return (
        <div className="space-y-8 print-hidden">
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
            <ResumeForm onGenerate={handleGenerate} isLoading={isLoading} />
            {user && <ResumeHistory />}
        </div>
     );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <div className="space-y-8 print-hidden">
        <ResumeForm onGenerate={handleGenerate} isLoading={isLoading} />
        {user && <ResumeHistory />}
      </div>
      <div className="lg:sticky top-24">
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={currentResume} 
          isReviewing={isReviewing}
          onEdit={setIsEditing}
          onGenerate={handleConfirmGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      </div>
    </div>
  );
}
