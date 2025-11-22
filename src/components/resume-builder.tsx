
"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/schema";
import { generateResumeAction } from "@/app/actions";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser } from "@/firebase";

type GenerationResult = {
  resume: string;
  suggestions: string;
};

export function ResumeBuilder() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [resumeData, setResumeData] = useState<ResumeData | null>(null);
  const [isReviewing, setIsReviewing] = useState(false);
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { user } = useUser();

  const handleDataForReview = (data: ResumeData) => {
    setResumeData(data);
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
    setResumeData(data); // Also update data on final generation
    setIsReviewing(false); // Move away from review screen to show loading state
    setResult(null);
    toast({
      title: "Generating your resume...",
      description: "The AI is working its magic. This may take a moment.",
    });

    const response = await generateResumeAction(user.uid, data);

    if (response.error || !response.resume || !response.suggestions) {
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: response.error || "An unknown error occurred. Please check your input and try again.",
      });
    } else {
      setResult({
        resume: response.resume,
        suggestions: response.suggestions,
      });
      toast({
        title: "Success!",
        description: "Your new resume has been generated.",
      });
    }
    setIsLoading(false);
  };

  const handleEdit = () => {
    setIsReviewing(false);
    setResult(null);
  };

  const showForm = !isReviewing && !result;

  // On mobile, we only show one component at a time.
  if (isMobile) {
     if (!showForm) {
      return (
         <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={resumeData} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          userId={user?.uid}
        />
      )
     }
     return <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} initialData={resumeData} />
  }

  // On desktop, we show both side-by-side.
  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div>
        <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} initialData={resumeData} />
      </div>
      <div className="lg:sticky top-8">
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={resumeData} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
          userId={user?.uid}
        />
      </div>
    </div>
  );
}
