
"use client";

import { useState } from "react";
import type { ResumeData, GeneratedResumeData, ResumeFormData } from "@/lib/schema";
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

  const handleGenerate = async (data: ResumeFormData) => {
    if (!user) {
      setAuthDialogOpen(true);
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

    toast({
      title: "Generating your documents...",
      description: "The AI is working its magic. This may take a moment.",
    });

    const formData = {
        title: currentResume.title,
        templateId: currentResume.templateId,
        sections: {
            summary: { content: currentResume.sections.summary.content },
            experience: currentResume.sections.experience.map(exp => ({
                ...exp,
                startDate: exp.startDate?.split('T')[0],
                endDate: exp.endDate?.split('T')[0] || 'Present',
            })),
            education: [],
            skills: currentResume.sections.skills,
        }
    };

    const response = await generateResumeAction(user.uid, formData as ResumeFormData, currentResume?.resumeId);
    
    if(response.error) {
         toast({
            variant: "destructive",
            title: "Generation Failed",
            description: response.error,
          });
    } else {
        toast({
            title: "Success!",
            description: currentResume?.resumeId ? "Your resume has been updated." : "Your new resume has been saved and generated.",
          });
    }

    generateAndSetResults(response, formData as ResumeFormData);
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
