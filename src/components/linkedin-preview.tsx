
"use client";

import * as React from "react";
import type { GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Linkedin } from "lucide-react";

interface LinkedInPreviewProps {
  content: GenerateLinkedInProfileOutput;
}

export const LinkedInPreview: React.FC<LinkedInPreviewProps> = ({ content }) => {
  const { summary, experience } = content;

  return (
    <Card className="bg-white">
        <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
                <Linkedin className="h-5 w-5" />
                LinkedIn Profile Suggestions
            </CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
                <h3 className="font-semibold text-base text-blue-700">About Section</h3>
                <div className="prose prose-sm max-w-none prose-p:my-2 dark:prose-invert">
                    <p className="whitespace-pre-wrap">{summary}</p>
                </div>
            </div>
            
            <Separator />

            <div className="space-y-4">
                 <h3 className="font-semibold text-base text-blue-700">Experience Section</h3>
                 {experience.map((job, index) => (
                    <div key={index} className="space-y-2 pb-4 border-b last:border-b-0">
                        <p className="font-bold">{job.job_title}</p>
                        <p className="text-sm font-medium text-gray-700">{job.company}</p>
                        <div className="prose prose-sm max-w-none prose-p:my-2 dark:prose-invert">
                             <div className="whitespace-pre-wrap text-gray-600">
                                {job.description}
                            </div>
                        </div>
                    </div>
                 ))}
            </div>

        </CardContent>
    </Card>
  );
};
