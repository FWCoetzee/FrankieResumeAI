"use client";

import { useState } from "react";
import type { ResumeData } from "@/lib/schema";
import { generateResumeAction } from "@/app/actions";
import { ResumeForm } from "./resume-form";
import { ResumePreview } from "./resume-preview";
import { useToast } from "@/hooks/use-toast";

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

  const handleDataForReview = (data: ResumeData) => {
    setResumeData(data);
    setResult(null); // Clear previous results
    setIsReviewing(true);
  };
  
  const handleGenerate = async (data: ResumeData) => {
    setIsLoading(true);
    setResumeData(data); // Also update data on final generation
    setIsReviewing(false); // Move away from review screen to show loading state
    setResult(null);
    toast({
      title: "Generating your resume...",
      description: "The AI is working its magic. This may take a moment.",
    });

    const response = await generateResumeAction(data);

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

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className={showForm ? "w-full" : "hidden lg:block w-full"}>
        <ResumeForm onGenerate={handleDataForReview} isLoading={isLoading} initialData={resumeData} />
      </div>
      <div className={showForm ? "hidden lg:block w-full lg:sticky top-8" : "w-full lg:sticky top-8"}>
        <ResumePreview 
          result={result} 
          isLoading={isLoading} 
          resumeData={resumeData} 
          isReviewing={isReviewing}
          onEdit={handleEdit}
          onGenerate={handleGenerate}
        />
      </div>
    </div>
  );
}
