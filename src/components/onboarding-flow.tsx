
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ArrowRight, Sparkles, FilePlus, Upload, Info } from 'lucide-react';
import { ResumeBuilder } from './resume-builder';
import { useResumeStore } from '@/hooks/use-resume-store';
import type { ResumeData } from '@/lib/schema';
import { v4 as uuidv4 } from "uuid";

const goals = [
  { id: 'Tech (ATS-Optimized)', title: 'Apply for my dream job', description: 'Tailor every detail for a specific role.' },
  { id: 'Professional Corporate', title: 'Update an old résumé', description: 'Refresh and modernize your existing document.' },
  { id: 'Student / No Experience', title: 'Create a résumé from scratch', description: 'We’ll guide you through building a new one.' },
  { id: 'Career Switch', title: 'Switching careers', description: 'Highlight transferable skills for a new industry.' },
  { id: 'Creative', title: 'Optimize my résumé with AI', description: 'Analyze and improve your current résumé’s impact.' },
];

const experienceLevels = [
  { id: 'Entry-level', label: 'No experience', description: 'Perfect for students and first-time job seekers.' },
  { id: 'Mid-level', label: '1–5 years', description: 'You’ve got some experience under your belt.' },
  { id: 'Senior', label: '6–10 years', description: 'You’re a seasoned professional in your field.' },
  { id: 'Lead', label: '10+ years', description: 'You’re a leader and an expert.' },
  { id: 'Executive', label: 'Executive', description: 'C-Suite or other top-level leadership.' },
];

const emptyValues: Partial<ResumeData> = {
  title: "",
  templateId: "modern",
  status: 'draft',
  sections: {
    summary: { content: "", lastEdited: new Date().toISOString() },
    experience: [],
    education: [],
    skills: [],
  },
  settings: {
    fontSize: 10,
    spacing: 'normal',
  },
  isDeleted: false,
};


const StepWelcome = ({ onNext }: { onNext: () => void }) => (
  <Card className="text-center">
    <CardHeader>
      <Sparkles className="mx-auto h-12 w-12 text-primary" />
      <CardTitle className="text-3xl mt-4">Welcome to the Future of Résumés</CardTitle>
      <CardDescription className="max-w-md mx-auto">This isn’t just a builder; it's your new career co-pilot. Precision-engineered, AI-driven.</CardDescription>
    </CardHeader>
    <CardContent>
      <Button size="lg" onClick={onNext}>
        Initialize Onboarding <ArrowRight className="ml-2" />
      </Button>
      <p className="text-xs text-muted-foreground mt-2">The process takes about 3 minutes.</p>
    </CardContent>
  </Card>
);

const StepGoal = ({ onNext, onSelect }: { onNext: () => void, onSelect: (val: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>What's the mission?</CardTitle>
      <CardDescription>Select your primary objective. This helps the AI calibrate its focus.</CardDescription>
    </CardHeader>
    <CardContent>
      <RadioGroup onValueChange={onSelect} className="space-y-4">
        {goals.map(goal => (
          <Label key={goal.id} htmlFor={goal.id} className="flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-muted has-[input:checked]:bg-muted has-[input:checked]:border-primary transition-colors">
            <RadioGroupItem value={goal.id} id={goal.id} />
            <div>
              <p className="font-semibold">{goal.title}</p>
              <p className="text-sm text-muted-foreground">{goal.description}</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </CardContent>
    <CardFooter>
      <Button onClick={onNext} className="ml-auto">Continue</Button>
    </CardFooter>
  </Card>
);

const StepExperience = ({ onNext, onSelect }: { onNext: () => void, onSelect: (val: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Define Your Experience Level</CardTitle>
      <CardDescription>How many years have you been in the workforce? This sets the tone.</CardDescription>
    </CardHeader>
    <CardContent>
      <RadioGroup onValueChange={onSelect} className="grid md:grid-cols-2 gap-4">
        {experienceLevels.map(level => (
          <Label key={level.id} htmlFor={level.id} className="flex items-center gap-4 border rounded-lg p-4 cursor-pointer hover:bg-muted has-[input:checked]:bg-muted has-[input:checked]:border-primary transition-colors">
            <RadioGroupItem value={level.id} id={level.id} />
            <div>
              <p className="font-semibold">{level.label}</p>
              <p className="text-sm text-muted-foreground">{level.description}</p>
            </div>
          </Label>
        ))}
      </RadioGroup>
    </CardContent>
    <CardFooter>
      <Button onClick={onNext} className="ml-auto">Continue</Button>
    </CardFooter>
  </Card>
);

const StepUpload = ({ onNext }: { onNext: () => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Source Your Data</CardTitle>
      <CardDescription>How would you like to begin? Upload an existing document or start with a clean slate.</CardDescription>
    </CardHeader>
    <CardContent className="grid md:grid-cols-2 gap-6">
      <Card className="p-6 flex flex-col items-center justify-center text-center">
        <Upload className="h-10 w-10 text-primary mb-4" />
        <h3 className="font-semibold">Upload an existing résumé</h3>
        <p className="text-sm text-muted-foreground mt-1">Our AI will parse and import your data automatically. (PDF, DOCX)</p>
        <Button variant="outline" className="mt-4" disabled>Coming Soon</Button>
        <p className="text-xs text-muted-foreground mt-2">This feature is under development.</p>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center text-center border-2 border-primary">
        <FilePlus className="h-10 w-10 text-primary mb-4" />
        <h3 className="font-semibold">Start fresh with the guided form</h3>
        <p className="text-sm text-muted-foreground mt-1">We'll walk you through each section, step-by-step.</p>
        <Button onClick={onNext} className="mt-4">Start Fresh</Button>
        <p className="text-xs text-muted-foreground mt-2">Time: ~3-5 min. The most accurate way to begin.</p>
      </Card>
    </CardContent>
  </Card>
);


const StepJobTarget = ({ onNext, onTargetChange }: { onNext: () => void, onTargetChange: (target: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>What Job Are You Targeting?</CardTitle>
      <CardDescription>Specify the exact role you're aiming for. This sets the title of your new resume project.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <Input placeholder="e.g., Senior Product Manager" onChange={(e) => onTargetChange(e.target.value)} />
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onNext} className="ml-auto">Finish Onboarding</Button>
    </CardFooter>
  </Card>
);


export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const { setCurrentResume } = useResumeStore();
  const [onboardingData, setOnboardingData] = useState({
      title: ""
  });
  const [showBuilder, setShowBuilder] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  
  const handleSelect = (key: keyof typeof onboardingData) => (value: string) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const handleFinish = () => {
    const initialData = {
      ...emptyValues,
      title: onboardingData.title || "My New Resume",
    } as ResumeData;
    setCurrentResume(initialData);
    setShowBuilder(true);
  };

  if (showBuilder) {
    return <ResumeBuilder />;
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return <StepWelcome onNext={handleNext} />;
      case 1:
        return <StepUpload onNext={() => setStep(3)} />; // Skip Goal and Experience for now
      case 2:
        return <StepJobTarget onNext={handleFinish} onTargetChange={handleSelect('title')} />;
      default:
        // Default to job target step if flow is messed up
        return <StepJobTarget onNext={handleFinish} onTargetChange={handleSelect('title')} />;
    }
  };

  return <div className="max-w-3xl mx-auto">{renderStep()}</div>;
}