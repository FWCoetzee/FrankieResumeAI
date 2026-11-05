
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
import { authFetch } from "@/lib/auth-fetch";


export function ResumeBuilder() {
  const { user } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
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
    // For MVP, we use anonymous sessions. 
    // We'll preserve the data in memory and later handle session-based generation.
    setFormForReview(data);
  };
  
  const ensureResumeExists = async (): Promise<number> => {
    if (currentResume?.resumeId && currentResume.resumeId > 0) {
      return currentResume.resumeId;
    }

    const response = await authFetch('/api/resumes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: currentResume?.title || 'Untitled Resume' }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create your resume draft.');
    }

    const data = await response.json();
    const resumeId = Number(data.resumeId);

    if (!resumeId) {
      throw new Error('The server did not return a valid resume ID.');
    }

    setCurrentResume({ ...currentResume, resumeId, title: currentResume?.title || 'Untitled Resume' } as ResumeData);
    return resumeId;
  };

  const handleConfirmGenerate = async () => {
    if (!currentResume) {
      toast({
        variant: "destructive",
        title: "Missing resume data",
        description: "Please complete the form before generating.",
      });
      return;
    }

    try {
      const resumeId = await ensureResumeExists();
      toast({
        title: "Generating your documents...",
        description: "The AI is creating and saving your tailored resume.",
      });

      const response = await authFetch(`/api/resumes/${resumeId}/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeData: currentResume }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'AI generation failed.');
      }

      const generationResult = await response.json();
      setGenerationResult({ ...generationResult, savedResumeId: resumeId });

      toast({
        title: "Success!",
        description: "Your resume content has been generated and saved.",
      });
    } catch (error) {
      console.error('AI generation error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred.';
      toast({
        variant: 'destructive',
        title: 'Generation Failed',
        description: errorMessage,
      });
      setGenerationResult({ error: errorMessage });
    }
  }

  const generateContentForResume = async (resumeId: number) => {
    // ... existing code ...

    if (!currentResume) return;

    toast({
      title: "Generating your documents...",
      description: "The AI is creating and saving your tailored resume.",
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
            <ResumeForm onGenerate={handleGenerate} isLoading={isLoading} />
            <ResumeHistory />
        </div>
     );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="space-y-8 print-hidden">
        <ResumeForm onGenerate={handleGenerate} isLoading={isLoading} />
        <ResumeHistory />
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
