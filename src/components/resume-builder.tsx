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
  const { toast } = useToast();

  const handleGenerate = async (data: ResumeData) => {
    setIsLoading(true);
    setResult(null);
    const response = await generateResumeAction(data);
    if (response.error || !response.resume || !response.suggestions) {
      toast({
        title: "Generation Failed",
        description: response.error || "An unknown error occurred.",
        variant: "destructive",
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

  return (
    <div className="grid lg:grid-cols-2 gap-12 items-start">
      <div className="w-full">
        <ResumeForm onGenerate={handleGenerate} isLoading={isLoading} />
      </div>
      <div className="w-full lg:sticky top-8">
        <ResumePreview result={result} isLoading={isLoading} />
      </div>
    </div>
  );
}
