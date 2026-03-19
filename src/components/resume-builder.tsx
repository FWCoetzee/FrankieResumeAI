
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
import { authFetch } from "@/lib/auth-fetch";


export function ResumeBuilder() {
  const { user } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const ANONYMOUS_RESUME_STORAGE_KEY = 'anonymousResumeData';


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
      // Save data to localStorage for anonymous users
      try {
        localStorage.setItem(ANONYMOUS_RESUME_STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error("Could not save resume to local storage", e);
      }
      setAuthDialogOpen(true);
      // Also keep in memory for immediate review if they close the dialog
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
    
    let resumeIdToGenerate = currentResume.resumeId;

    // If the resume has no ID, it's a new one. Create it first.
    if (!resumeIdToGenerate) {
        try {
            const createResponse = await authFetch('/api/resumes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: currentResume.title }),
            });
            if (!createResponse.ok) {
              const errorData = await createResponse.json();
              throw new Error(errorData.error || 'Failed to create new resume project.');
            }
            
            const { resumeId } = await createResponse.json();
            resumeIdToGenerate = resumeId;
            
            // Update the store with the new ID
            setCurrentResume({ ...currentResume, resumeId });

        } catch (error) {
            console.error("New Resume Creation Error:", error);
            const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
            toast({ variant: "destructive", title: "Creation Failed", description: errorMessage });
            return; // Stop if we can't create the resume project
        }
    }
    
    // Proceed with generation using the now-guaranteed resume ID.
    generateContentForResume(resumeIdToGenerate);
  }

  const generateContentForResume = async (resumeId: number) => {
    if (!currentResume) return;

    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });

    try {
        const response = await authFetch(`/api/resumes/${resumeId}/generate`, {
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

  const handleAcceptEdit = async (fieldPath: string, newValue: string | string[]) => {
    if (!result || !result.resume || !currentResume || !currentResume.resumeId) {
      toast({
        variant: "destructive",
        title: "Save Error",
        description: "Cannot save edit, no active resume found.",
      });
      return;
    }
  
    // Create a deep copy to avoid direct mutation of the store's state
    const newResult = cloneDeep(result);
  
    // Apply the change to the copied object. The field path from AI editor is like 'resume.summary'
    // so we remove the 'resume.' prefix to set it on the resume object directly.
    set(newResult, fieldPath, newValue);
      
    // Optimistically update the UI to feel instantaneous
    updateResult(newResult);
  
    // Persist the entire edited resume content to the backend
    try {
      const response = await authFetch(`/api/resumes/${currentResume.resumeId}/save-edit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Send the entire edited resume object
        body: JSON.stringify({ editedContent: newResult.resume }),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save edit.');
      }
  
      await response.json();
  
      toast({
        title: "Content Saved",
        description: "Your edit has been saved as a new version.",
      });
    } catch (error) {
      console.error("Save Edit Error:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({
        variant: "destructive",
        title: "Save Failed",
        description: errorMessage,
      });
      // Revert the optimistic update on failure
      updateResult(result);
    }
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
