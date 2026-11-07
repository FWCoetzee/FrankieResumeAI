/**
 * @author Franklin Coetzee
 * @id 8510305083081
 * @email salazar3593@gmail.com
 * @credit AI assistance
 */

import React from 'react';
import { Bot, Target, Zap, BookCopy, Linkedin, Languages } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const features = [
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI Resume Generator",
      description: "Our AI crafts a professional, keyword-rich resume from your raw notes in seconds. No more staring at a blank page."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Job-Tailored Variants",
      description: "Instantly create multiple versions of your resume, each perfectly tailored to a specific job description."
    },
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "ATS Keyword Optimization",
      description: "Beat the bots. We automatically identify and weave in essential keywords to get your resume past applicant tracking systems."
    },
    {
      icon: <BookCopy className="h-8 w-8 text-primary" />,
      title: "AI Cover Letter Generator",
      description: "Generate persuasive cover letters that complement your resume and highlight your most relevant qualifications."
    },
    {
      icon: <Linkedin className="h-8 w-8 text-primary" />,
      title: "LinkedIn Rewrite Tool",
      description: "Optimize your LinkedIn profile summary and experience sections with AI-powered suggestions for maximum impact."
    },
    {
      icon: <Languages className="h-8 w-8 text-primary" />,
      title: "Multi-Language Support",
      description: "Reach a wider audience by exporting your resume in multiple languages, including all 11 official languages of South Africa."
    },
];

export default function FeaturesPage() {
  return (
    <div className="max-w-6xl mx-auto py-16 px-6 space-y-12">
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Our Features</p>
        <h1 className="text-4xl font-bold">Everything you need to land the job</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our AI-powered toolkit is designed to eliminate the friction of job applications.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <Card key={index} className="transition-all hover:shadow-lg">
            <CardHeader>
              <div className="mb-2">{feature.icon}</div>
              <CardTitle>{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
