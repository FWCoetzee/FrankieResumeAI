
"use client";

import { useState } from "react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { generateResumeAction } from "@/app/actions";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/firebase";
import { ResumeHistory } from "./resume-history";
import { set, cloneDeep } from "lodash";
import { useResumeStore } from "@/hooks/use-resume-store";
import { AuthDialog } from "./auth-dialog";

export function ResumeBuilder() {
  const { user } = useUser();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [authDialogOpen, setAuthDialogOpen] = useState(false);

  // Zustand store provides all the state and actions
  const {
    currentResume,
    result,
    isLoading,
    isReviewing,
    setFormForReview,
    generateAndSetResults,
    setIsEditing,
    updateResult,
  } = useResumeStore();

  const handleGenerate = async (data: ResumeData) => {
    if (!user) {
      setAuthDialogOpen(true);
      return;
    }
    
    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });
    
    // Ensure the ownerId is set correctly before sending to the action.
    const dataWithUser = { ...data, ownerId: user.uid };

    const response = await generateResumeAction(user.uid, dataWithUser);
    generateAndSetResults(response, dataWithUser); // This action is now in the store
  };

  const handleAcceptEdit = (fieldPath: string, newValue: string | string[]) => {
    if (!result || !currentResume) return;
  
    // Use lodash.cloneDeep to create a new object to avoid direct mutation
    const newResult = cloneDeep(result);
  
    // Use lodash.set to safely update the nested property
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
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      )
     }
     return (
        <div className="space-y-8 print-hidden">
            <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
            <ResumeForm onGenerate={setFormForReview} isLoading={isLoading} />
            {user && <ResumeHistory />}
        </div>
     );
  }

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <AuthDialog open={authDialogOpen} onOpenChange={setAuthDialogOpen} />
      <div className="space-y-8 print-hidden">
        <ResumeForm onGenerate={setFormForReview} isLoading={isLoading} />
        {user && <ResumeHistory />}
      </div>
      <div className="lg:sticky top-24">
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={currentResume} 
          isReviewing={isReviewing}
          onEdit={setIsEditing}
          onGenerate={handleGenerate}
          onAcceptEdit={handleAcceptEdit}
        />
      </div>
    </div>
  );
}
