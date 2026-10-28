"use client";

import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resumeFormSchema, type ResumeFormData } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, Trash2, Loader2, FilePlus2, Eraser, User, Settings, Briefcase, Star, GraduationCap, Lightbulb, BookUser, Award } from "lucide-react";
import { useEffect, useState } from "react";
import { useResumeStore } from "@/hooks/use-resume-store";
import { v4 as uuidv4 } from "uuid";
import { useAutosave } from "@/hooks/use-autosave";
import { authFetch } from "@/lib/auth-fetch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Wand2, Loader2 } from "lucide-react";

const AI_MODES = [
  { label: "Strengthen", value: "Strengthen", description: "Make it more impactful" },
  { label: "Job-Align", value: "Job-Align", description: "Align with target job" },
  { label: "Shorten", value: "Shorten", description: "Make it more concise" },
  { label: "Professional", value: "Tone", description: "Change to professional tone" },
  { label: "Achievement", value: "Achievement", description: "Focus on measurable results" },
];

const IMPACT_CLICHES = [
  "responsible for",
  "helped with",
  "tasked with",
  "assisted in",
  "worked on",
  "familiar with",
  "experience in",
];

function checkImpact(text: string) {
  const lowerText = text.toLowerCase();
  const foundCliches = IMPACT_CLICHES.filter(cliche => lowerText.includes(cliche));
  return {
    isLowImpact: foundCliches.length > 0,
    cliches: foundCliches,
  };
}

function RefineField({ 
  value, 
  onUpdate, 
  placeholder = "Refining...", 
  label = "Refine" 
}: { 
  value: string, 
  onUpdate: (newValue: string) => void, 
  placeholder?: string,
  label?: string 
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { currentResume } = useResumeStore();
  const { toast } = useToast();

  const handleRefine = async (mode: string) => {
    if (!currentResume?.resumeId || !value) return;
    setIsLoading(true);
    try {
      const response = await authFetch('/api/resumes/refine-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: currentResume.resumeId,
          payload: {
            mode,
            content: value,
            targetJob: currentResume.title,
          }
        }),
      });

      if (!response.ok) throw new Error('Refinement failed');
      const data = await response.json();
      
      // Optimistically update the field before the user even sees the toast
      onUpdate(data.editedText);
      
      toast({
        title: "Refined!",
        description: `Applied ${mode} transformation.`,
      });
    } catch (e) {
      toast({ variant: 'destructive', title: 'AI Error', description: 'Could not refine text.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 px-2 gap-1 text-xs text-muted-foreground hover:text-primary">
          {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
          {label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-2 w-64">
        <p className="text-xs font-medium mb-2 px-2">Select AI transformation:</p>
        <div className="grid gap-1">
          {AI_MODES.map(mode => (
            <Button 
              key={mode.value} 
              variant="ghost" 
              size="sm" 
              className="justify-start h-auto p-2 text-xs text-left"
              onClick={() => handleRefine(mode.value)}
              disabled={isLoading}
            >
              <div className="flex flex-col">
                <span className="font-semibold">{mode.label}</span>
                <span className="text-[10px] text-muted-foreground">{mode.description}</span>
              </div>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}

interface ResumeFormProps {
  onGenerate: (data: ResumeFormData) => void;
  isLoading: boolean;
}

const emptyValues: ResumeFormData = {
  title: "",
  templateId: "modern",
  phone: "",
  location: "",
  jobDescription: "",
  sections: {
    summary: { content: "" },
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
    references: [],
  },
};

const sampleValues: ResumeFormData = {
  title: "Senior Frontend Engineer",
  templateId: "modern",
  phone: "082 123 4567",
  location: "Johannesburg, South Africa",
  jobDescription: `We are looking for a Senior Frontend Engineer to join our team. The ideal candidate will have strong experience with React, TypeScript, and Next.js. Responsibilities include developing new user-facing features, building reusable components, and optimizing applications for maximum speed and scalability. Experience with state management libraries like Zustand or Redux is a plus.`,
  sections: {
    summary: {
      content: "A passionate and experienced Senior Frontend Engineer with a proven track record of building and launching successful web applications. Expert in React, TypeScript, and Next.js, with a keen eye for detail and a dedication to creating exceptional user experiences. Seeking to leverage my skills to contribute to a mission-driven team."
    },
    experience: [
      {
        id: uuidv4(),
        role: "Senior Frontend Engineer",
        company: "Innovate Inc.",
        startDate: "2020-01-01",
        endDate: "Present",
        bullets: [
            "Improved application load times by 40% by implementing code splitting and lazy loading.",
            "Redesigned the state management system using Zustand, reducing boilerplate code by 60%.",
            "Received the 'Engineer of the Quarter' award for performance and leadership."
        ],
      },
      {
        id: uuidv4(),
        role: "Software Engineer",
        company: "Tech Solutions LLC",
        startDate: "2018-06-01",
        endDate: "2020-01-01",
        bullets: [
            "Successfully migrated legacy class components to modern functional components with Hooks, improving code readability and maintainability.",
            "Contributed to a 20% increase in conversion rates by optimizing the checkout flow."
        ],
      }
    ],
    education: [
      {
        id: uuidv4(),
        degree: "B.Sc. in Computer Science",
        institution: "University of Technology",
        startYear: "2014",
        endYear: "2018",
      }
    ],
    skills: ["React", "TypeScript", "Next.js", "JavaScript (ES6+)", "HTML5 & CSS3", "Tailwind CSS", "State Management (Zustand, Redux)", "Testing (Jest, React Testing Library)"],
    projects: [
        {
            id: uuidv4(),
            title: "Personal Portfolio Website",
            description: "Developed and deployed a personal portfolio using Next.js and Tailwind CSS, showcasing my projects and skills. Implemented server-side rendering for improved performance and SEO.",
        }
    ],
    certifications: [
        "Certified React Developer",
        "Google Cloud Certified - Associate Cloud Engineer"
    ],
    references: [
        {
            id: uuidv4(),
            name: "Jane Smith",
            contact: "Available upon request",
        }
    ]
  }
};

export function ResumeForm({ onGenerate, isLoading }: ResumeFormProps) {
  const { currentResume, setCurrentResume } = useResumeStore();
  const { toast } = useToast();

  const form = useForm<ResumeFormData>({
    resolver: zodResolver(resumeFormSchema),
    defaultValues: emptyValues,
    mode: "onBlur",
  });

  // Autosave to LocalStorage AND Database
  useAutosave(
    form, 
    'anonymousResumeData', 
    emptyValues, 
    async (data) => {
      if (!currentResume?.resumeId) return;
      
      try {
        await authFetch(`/api/resumes/${currentResume.resumeId}/save-edit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ editedContent: data }),
        });
      } catch (e) {
        console.error('Autosave to DB failed', e);
      }
    }
  );
  
  // NEW: Visual indicator for autosave status
  const [isSaving, setIsSaving] = useState(false);
  useEffect(() => {
    const interval = setInterval(() => {
      // We simulate the "saving" state because useAutosave is debounced.
      // In a real production app, we'd track the actual promise of the API call.
      setIsSaving(true);
      setTimeout(() => setIsSaving(false), 800);
    }, 15000); // a subtle blink every 15s to show it's alive
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (currentResume) {
        // Map ResumeData (from store) to ResumeFormData for form compatibility
        const formData: ResumeFormData = {
            title: currentResume.title,
            templateId: currentResume.templateId,
            phone: currentResume.phone || "",
            location: currentResume.location || "",
            jobDescription: currentResume.jobDescription || "",
            sections: {
                summary: { content: currentResume.sections.summary?.content || "" },
                experience: (currentResume.sections.experience || []).map(exp => ({
                    ...exp,
                    startDate: exp.startDate?.split('T')[0] || '', // Format for input[type=date]
                    endDate: exp.endDate?.split('T')[0] || '',
                })),
                education: currentResume.sections.education || [],
                skills: currentResume.sections.skills || [],
                projects: currentResume.sections.projects || [],
                certifications: currentResume.sections.certifications || [],
                references: currentResume.sections.references || [],
            }
        };
        form.reset(formData);
    } else {
        form.reset(emptyValues);
    }
  }, [currentResume, form.reset]);

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control: form.control, name: "sections.experience" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control: form.control, name: "sections.education" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control: form.control, name: "sections.projects" });
  const { fields: refFields, append: appendRef, remove: removeRef } = useFieldArray({ control: form.control, name: "sections.references" });
  
  const handleFillSampleData = () => {
    form.reset(sampleValues);
  }
  
  const handleClearForm = () => {
    form.reset(emptyValues);
    setCurrentResume(null);
  }
  
  const onSubmit = (data: ResumeFormData) => {
    onGenerate(data);
  }

  const SectionHeader = ({ title, onAdd }: { title: string; onAdd: () => void }) => (
    <div className="flex justify-between items-center mb-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <Button type="button" variant="ghost" size="sm" onClick={onAdd} className="gap-1">
        <PlusCircle className="h-4 w-4" /> Add
      </Button>
    </div>
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
            <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                    <div className="flex flex-wrap gap-2">
                        <Button type="button" size="sm" onClick={handleFillSampleData}><FilePlus2 className="mr-2 h-4 w-4" /> Fill with Sample Data</Button>
                        <Button type="button" size="sm" onClick={handleClearForm}><Eraser className="mr-2 h-4 w-4" /> Clear Form</Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        {isSaving ? (
                            <span className="flex items-center gap-1 animate-pulse">
                                <Loader2 className="h-3 w-3 animate-spin" /> Saving...
                            </span>
                        ) : (
                            <span className="flex items-center gap-1">
                                <Badge variant="outline" className="text-[10px] h-5 px-1">Saved</Badge>
                            </span>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>

        <Tabs defaultValue="customization" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-auto md:h-10 md:grid-cols-8">
                <TabsTrigger value="customization"><Settings className="mr-2 hidden md:inline-flex"/> General</TabsTrigger>
                <TabsTrigger value="personal_info"><User className="mr-2 hidden md:inline-flex"/> Summary</TabsTrigger>
                <TabsTrigger value="experience"><Briefcase className="mr-2 hidden md:inline-flex"/> Experience</TabsTrigger>
                <TabsTrigger value="education"><GraduationCap className="mr-2 hidden md:inline-flex"/> Education</TabsTrigger>
                <TabsTrigger value="projects"><Lightbulb className="mr-2 hidden md:inline-flex"/> Projects</TabsTrigger>
                <TabsTrigger value="skills"><Star className="mr-2 hidden md:inline-flex"/> Skills</TabsTrigger>
                <TabsTrigger value="certifications"><Award className="mr-2 hidden md:inline-flex"/> Certs</TabsTrigger>
                <TabsTrigger value="references"><BookUser className="mr-2 hidden md:inline-flex"/> Refs</TabsTrigger>
            </TabsList>
            
            <Card className="mt-4">
              <CardContent className="pt-6">
                <TabsContent value="customization" className="m-0 space-y-4">
                  <FormField name="title" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Resume Title / Target Job</FormLabel><FormControl><Input placeholder="e.g., Senior Software Engineer Application" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  <div className="grid md:grid-cols-2 gap-4">
                    <FormField name="phone" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Phone Number</FormLabel><FormControl><Input placeholder="e.g., 082 123 4567" {...field} /></FormControl><FormMessage /></FormItem> )} />
                    <FormField name="location" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Location</FormLabel><FormControl><Input placeholder="e.g., Cape Town, South Africa" {...field} /></FormControl><FormMessage /></FormItem> )} />
                  </div>
                   <FormField name="jobDescription" control={form.control} render={({ field }) => ( <FormItem><FormLabel>Target Job Description</FormLabel><FormControl><Textarea placeholder="Paste the job description here so the AI can tailor your resume..." {...field} rows={6} /></FormControl><FormDescription>Providing a job description greatly improves the quality of AI suggestions.</FormDescription><FormMessage /></FormItem> )} />
                </TabsContent>
                
                <TabsContent value="personal_info" className="m-0 space-y-4">
                    <FormField name="sections.summary.content" control={form.control} render={({ field }) => {
                        const impact = checkImpact(field.value);
                        return (
                            <FormItem>
                                <div className="flex justify-between items-center mb-2">
                                    <FormLabel>Professional Summary</FormLabel>
                                    <RefineField 
                                        value={field.value} 
                                        onUpdate={(val) => field.onChange(val)} 
                                        label="Polish Summary" 
                                    />
                                </div>
                                <FormControl>
                                    <Textarea placeholder="A brief summary of your career, skills, and goals..." {...field} rows={6} />
                                </FormControl>
                                {impact.isLowImpact && (
                                    <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                                        <Wand2 className="h-3 w-3" /> 
                                        Tip: Avoid cliches like "{impact.cliches[0]}". Use "Strengthen" to improve impact.
                                    </p>
                                )}
                                <FormMessage />
                            </FormItem> 
                        );
                    }} />
                </TabsContent>

                <TabsContent value="experience" className="m-0 space-y-4">
                    <SectionHeader title="Your Experience" onAdd={() => appendExp({ role: "", company: ""})} />
                    {expFields.map((field, index) => (
                        <Card key={field.id} className="relative bg-muted/50 p-4">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeExp(index)}><Trash2 className="h-4 w-4" /></Button>
                            <FormField name={`sections.experience.${index}.role`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Role</FormLabel><FormControl><Input placeholder="Software Engineer" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name={`sections.experience.${index}.company`} control={form.control} render={({ field }) => ( <FormItem className="mt-4"><FormLabel>Company</FormLabel><FormControl><Input placeholder="Acme Inc." {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <FormField name={`sections.experience.${index}.startDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name={`sections.experience.${index}.endDate`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Date (leave blank if current)</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                             <FormField name={`sections.experience.${index}.bullets`} control={form.control} render={({ field }) => {
                                const impact = checkImpact(Array.isArray(field.value) ? field.value.join(' ') : '');
                                return (
                                    <FormItem className="mt-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <FormLabel>Key Achievements (as bullet points)</FormLabel>
                                        <RefineField 
                                            value={Array.isArray(field.value) ? field.value.join('\n') : ''} 
                                            onUpdate={(val) => field.onChange(val.split('\n'))} 
                                            label="Improve Bullets" 
                                        />
                                    </div>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Enter each achievement on a new line."
                                            onChange={e => field.onChange(e.target.value.split('\n'))}
                                            value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                            rows={4}
                                        />
                                    </FormControl>
                                    {impact.isLowImpact && (
                                        <p className="text-[10px] text-amber-600 font-medium mt-1 flex items-center gap-1">
                                            <Wand2 className="h-3 w-3" /> 
                                            Tip: We found low-impact phrasing. Try the "Strengthen" mode to focus on results.
                                        </p>
                                    )}
                                    <FormDescription>Separate each bullet point with a new line.</FormDescription>
                                    <FormMessage />
                                    </FormItem> 
                                );
                            }} />
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="education" className="m-0 space-y-4">
                    <SectionHeader title="Your Education" onAdd={() => appendEdu({ degree: "", institution: "" })} />
                    {eduFields.map((field, index) => (
                        <Card key={field.id} className="relative bg-muted/50 p-4">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeEdu(index)}><Trash2 className="h-4 w-4" /></Button>
                            <FormField name={`sections.education.${index}.degree`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Degree / Certificate</FormLabel><FormControl><Input placeholder="B.Sc. in Computer Science" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name={`sections.education.${index}.institution`} control={form.control} render={({ field }) => ( <FormItem className="mt-4"><FormLabel>Institution</FormLabel><FormControl><Input placeholder="University of Technology" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <div className="grid md:grid-cols-2 gap-4 mt-4">
                                <FormField name={`sections.education.${index}.startYear`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Start Year</FormLabel><FormControl><Input placeholder="2018" {...field} /></FormControl><FormMessage /></FormItem> )} />
                                <FormField name={`sections.education.${index}.endYear`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>End Year</FormLabel><FormControl><Input placeholder="2022" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            </div>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="projects" className="m-0 space-y-4">
                    <SectionHeader title="Projects / Leadership" onAdd={() => appendProj({ title: "", description: "" })} />
                    {projFields.map((field, index) => (
                        <Card key={field.id} className="relative bg-muted/50 p-4">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeProj(index)}><Trash2 className="h-4 w-4" /></Button>
                            <FormField name={`sections.projects.${index}.title`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Project Title</FormLabel><FormControl><Input placeholder="Personal Portfolio Website" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name={`sections.projects.${index}.description`} control={form.control} render={({ field }) => ( <FormItem className="mt-4"><FormLabel>Description</FormLabel><FormControl><Textarea placeholder="Describe the project, your role, and the outcome." {...field} rows={4} /></FormControl><FormMessage /></FormItem> )} />
                        </Card>
                    ))}
                </TabsContent>
                
                <TabsContent value="skills" className="m-0 space-y-6">
                    <FormField
                        name="sections.skills"
                        control={form.control}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Your Skills</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Enter skills separated by commas"
                                onChange={e => field.onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                                value={Array.isArray(field.value) ? field.value.join(', ') : ''}
                            />
                            </FormControl>
                            <FormDescription>Separate each skill with a comma.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </TabsContent>

                <TabsContent value="certifications" className="m-0 space-y-6">
                    <FormField
                        name="sections.certifications"
                        control={form.control}
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Certifications</FormLabel>
                            <FormControl>
                            <Textarea
                                placeholder="Enter each certification on a new line"
                                onChange={e => field.onChange(e.target.value.split('\n').map(s => s.trim()).filter(Boolean))}
                                value={Array.isArray(field.value) ? field.value.join('\n') : ''}
                                rows={5}
                            />
                            </FormControl>
                            <FormDescription>Separate each certification with a new line.</FormDescription>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </TabsContent>

                <TabsContent value="references" className="m-0 space-y-4">
                    <SectionHeader title="Your References" onAdd={() => appendRef({ name: "", contact: "" })} />
                    {refFields.map((field, index) => (
                        <Card key={field.id} className="relative bg-muted/50 p-4">
                            <Button type="button" variant="destructive" size="icon" className="absolute top-4 right-4 h-7 w-7" onClick={() => removeRef(index)}><Trash2 className="h-4 w-4" /></Button>
                            <FormField name={`sections.references.${index}.name`} control={form.control} render={({ field }) => ( <FormItem><FormLabel>Reference Name</FormLabel><FormControl><Input placeholder="Jane Smith" {...field} /></FormControl><FormMessage /></FormItem> )} />
                            <FormField name={`sections.references.${index}.contact`} control={form.control} render={({ field }) => ( <FormItem className="mt-4"><FormLabel>Contact Info / Relationship</FormLabel><FormControl><Input placeholder="Available upon request" {...field} /></FormControl><FormMessage /></FormItem> )} />
                        </Card>
                    ))}
                </TabsContent>

              </CardContent>
            </Card>
        </Tabs>

        <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
          {isLoading ? ( <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating... </> ) : ( "Review & Generate" )}
        </Button>
      </form>
    </Form>
  );
}
