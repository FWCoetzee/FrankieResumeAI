
'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ArrowRight, Sparkles, Check, Briefcase, GraduationCap, Target, Upload, FilePlus, BrainCircuit, Bot, Info, CheckCircle } from 'lucide-react';
import { ResumeBuilder } from './resume-builder';

const goals = [
  { id: 'dream_job', title: 'Apply for my dream job', description: 'Tailor every detail for a specific role.' },
  { id: 'update', title: 'Update an old résumé', description: 'Refresh and modernize your existing document.' },
  { id: 'from_scratch', title: 'Create a résumé from scratch', description: 'We’ll guide you through building a new one.' },
  { id: 'career_switch', title: 'Switching careers', description: 'Highlight transferable skills for a new industry.' },
  { id: 'optimize', title: 'Optimize my résumé with AI', description: 'Analyze and improve your current résumé’s impact.' },
];

const experienceLevels = [
  { id: 'no_experience', label: 'No experience', description: 'Perfect for students and first-time job seekers.' },
  { id: '1-2', label: '1–2 years', description: 'You’ve got some experience under your belt.' },
  { id: '3-5', label: '3–5 years', description: 'You’re established and growing your career.' },
  { id: '6-10', label: '6–10 years', description: 'You’re a seasoned professional in your field.' },
  { id: '10+', label: '10+ years', description: 'You’re a leader and an expert.' },
];

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

const StepGoal = ({ onNext, onSelect }: { onNext: () => void, onSelect: (goal: string) => void }) => (
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

const StepExperience = ({ onNext, onSelect }: { onNext: () => void, onSelect: (level: string) => void }) => (
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
        <Button variant="outline" className="mt-4">Upload Document</Button>
        <p className="text-xs text-muted-foreground mt-2">Time: ~1 min. Your data is processed securely and never stored without permission.</p>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center text-center">
        <FilePlus className="h-10 w-10 text-primary mb-4" />
        <h3 className="font-semibold">Start fresh with guided questions</h3>
        <p className="text-sm text-muted-foreground mt-1">We'll walk you through each section, step-by-step.</p>
        <Button onClick={onNext} className="mt-4">Start Fresh</Button>
        <p className="text-xs text-muted-foreground mt-2">Time: ~3-5 min. The most accurate way to begin.</p>
      </Card>
    </CardContent>
  </Card>
);

const StepSkills = ({ onNext, onSkillsChange }: { onNext: () => void, onSkillsChange: (skills: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>Identify Your Core Skills</CardTitle>
      <CardDescription>List your top professional skills. The AI will use these to build your competency section. Separate each skill with a comma.</CardDescription>
    </CardHeader>
    <CardContent>
      <Textarea
        placeholder="e.g., Project Management, React, Data Analysis, Public Speaking, Figma"
        rows={5}
        onChange={(e) => onSkillsChange(e.target.value)}
      />
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" size="sm" className="gap-1"><BrainCircuit className="h-4 w-4" /> Smart Suggestions</Button>
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onNext} className="ml-auto">Continue</Button>
    </CardFooter>
  </Card>
);

const StepJobTarget = ({ onNext, onTargetChange }: { onNext: () => void, onTargetChange: (target: string) => void }) => (
  <Card>
    <CardHeader>
      <CardTitle>What Job Are You Targeting?</CardTitle>
      <CardDescription>Specify the exact role you're aiming for. The more precise, the better the AI's output.</CardDescription>
    </CardHeader>
    <CardContent>
      <div className="flex items-center gap-2">
        <Input placeholder="e.g., Senior Product Manager" onChange={(e) => onTargetChange(e.target.value)} />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon"><Info className="h-4 w-4" /></Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>The AI uses this to select keywords and frame your experience.</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </CardContent>
    <CardFooter>
      <Button onClick={onNext} className="ml-auto">Continue</Button>
    </CardFooter>
  </Card>
);

const StepConfirm = ({ onGenerate }: { onGenerate: () => void }) => (
  <Card className="text-center">
    <CardHeader>
      <Bot className="mx-auto h-12 w-12 text-primary" />
      <CardTitle className="text-3xl mt-4">System Ready. Awaiting Command.</CardTitle>
      <CardDescription>The AI has been configured with your inputs. Here’s what we’ll generate:</CardDescription>
    </CardHeader>
    <CardContent className="max-w-sm mx-auto space-y-2 text-left">
      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Professional Summary</p>
      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Curated Skills Section</p>
      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> ATS-Optimized Formatting</p>
      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Modern, Clean Layout</p>
      <p className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-green-500" /> Job-Tailored Language</p>
    </CardContent>
    <CardFooter className="flex-col gap-2">
      <Button size="lg" onClick={onGenerate}>Generate My Résumé <Sparkles className="ml-2" /></Button>
      <p className="text-xs text-muted-foreground">Crafting your new résumé... This may take up to 30 seconds.</p>
    </CardFooter>
  </Card>
);


export function OnboardingFlow() {
  const [step, setStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState({
    goal: '',
    experienceLevel: '',
    skills: '',
    jobTarget: '',
  });
  const [showBuilder, setShowBuilder] = useState(false);

  const handleNext = () => setStep(prev => prev + 1);
  const handleSelect = (key: keyof typeof onboardingData) => (value: string) => {
    setOnboardingData(prev => ({ ...prev, [key]: value }));
  };

  const handleGenerate = () => {
    console.log("Generating with data:", onboardingData);
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
        return <StepGoal onNext={handleNext} onSelect={handleSelect('goal')} />;
      case 2:
        return <StepExperience onNext={handleNext} onSelect={handleSelect('experienceLevel')} />;
      case 3:
        return <StepUpload onNext={handleNext} />;
      case 4:
        return <StepSkills onNext={handleNext} onSkillsChange={handleSelect('skills')} />;
      case 5:
        return <StepJobTarget onNext={handleNext} onTargetChange={handleSelect('jobTarget')} />;
      case 6:
        return <StepConfirm onGenerate={handleGenerate} />;
      default:
        return <StepWelcome onNext={() => setStep(1)} />;
    }
  };

  return <div className="max-w-3xl mx-auto">{renderStep()}</div>;
}
