
"use client";

import * as React from "react";
import { createRoot } from 'react-dom/client';
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, Pencil, Bot, FileSignature } from "lucide-react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { CreativeTemplate } from "./templates/creative-template";
import { cn } from "@/lib/utils";
import { EditableField } from "./editable-field";

interface ResumePreviewProps {
  result: { resume: GeneratedResumeData; suggestions: string; coverLetter: string; } | null;
  isLoading: boolean;
  resumeData: ResumeData | null;
  isReviewing: boolean;
  onEdit: () => void;
  onGenerate: (data: ResumeData) => void;
  onAcceptEdit: (fieldPath: string, newValue: string) => void;
}

const LoadingSkeleton = () => (
  <Card className="overflow-hidden">
    <CardHeader>
      <Skeleton className="h-6 w-1/3" />
    </CardHeader>
    <CardContent className="p-6 space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
      <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
       <div className="space-y-4">
        <Skeleton className="h-6 w-1/4 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </CardContent>
  </Card>
);

const Placeholder = () => (
  <Card className="flex items-center justify-center min-h-[500px] lg:min-h-[calc(100vh-8rem)] border-dashed border-2">
    <div className="text-center text-muted-foreground p-8">
      <FileText className="mx-auto h-12 w-12 mb-4" />
      <h3 className="text-lg font-semibold">Your resume will appear here</h3>
      <p className="text-sm">Fill out the form and click "Review & Generate" to see the result.</p>
    </div>
  </Card>
);

const ReviewScreen = ({ resumeData, onEdit, onGenerate, isLoading }: { resumeData: ResumeData, onEdit: () => void, onGenerate: (data: ResumeData) => void, isLoading: boolean }) => {
  const { personal_info, work_experience, education, skills, projects, certifications, target_job_title } = resumeData;

  return (
    <Card className="shadow-lg backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>This is a preview of the data that will be sent to the AI. Review it, then generate your documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm max-h-[60vh] overflow-y-auto p-6 bg-muted/50 rounded-md border">
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{personal_info.full_name}</h2>
            <p className="text-muted-foreground">{target_job_title}</p>
            <div className="flex justify-center gap-4 text-xs mt-2 text-muted-foreground">
                <span>{personal_info.email}</span>
                <span>|</span>
                <span>{personal_info.phone}</span>
                {personal_info.location && <><span>|</span><span>{personal_info.location}</span></>}
            </div>
        </div>

        {personal_info.summary && (
            <div className="space-y-2">
                <h3 className="text-md font-semibold text-center uppercase tracking-wider text-muted-foreground">Summary</h3>
                <p className="text-center text-sm text-pretty">{personal_info.summary}</p>
            </div>
        )}
        
        <Separator />
        
        {Array.isArray(skills) && skills.length > 0 && (
           <div className="space-y-2">
              <h3 className="font-semibold text-md">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
              </div>
            </div>
        )}

        {work_experience.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-md">Work Experience</h3>
            {work_experience.map((job, index) => (
              <div key={index} className="space-y-1.5 pl-4">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{job.job_title} at {job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.start_date} - {job.end_date}</p>
                </div>
                {job.responsibilities && <p className="text-pretty text-muted-foreground"> {job.responsibilities}</p>}
                {job.achievements && <p className="text-pretty"><strong>Achievements:</strong> {job.achievements}</p>}
              </div>
            ))}
          </div>
        )}
        
        {education.length > 0 && (
           <div className="space-y-2">
            <h3 className="font-semibold text-md">Education</h3>
              {education.map((edu, index) => (
                <div key={index} className="space-y-1 flex justify-between items-baseline pl-4">
                  <div>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-muted-foreground">{edu.institution}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{edu.start_year} - {edu.end_year}</p>
                </div>
              ))}
            </div>
        )}

        {Array.isArray(projects) && projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-md">Projects</h3>
            {projects.map((proj, index) => (
              <div key={index} className="space-y-1.5 pl-4">
                <p className="font-semibold">{proj.title}</p>
                {proj.description && <p className="text-pretty text-muted-foreground">{proj.description}</p>}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 &&
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((tech, i) => <Badge key={i} variant="outline">{tech}</Badge>)}
                  </div>
                }
              </div>
            ))}
          </div>
        )}

        {Array.isArray(certifications) && certifications.length > 0 && (
           <div className="space-y-2">
            <h3 className="font-semibold text-md">Certifications</h3>
              <div className="flex flex-wrap gap-2 pl-4">
                {certifications.map((cert, index) => <Badge key={index} variant="secondary">{cert}</Badge>)}
              </div>
            </div>
        )}

      </CardContent>
       <CardFooter className="flex-col sm:flex-row sm:justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto"><Pencil className="mr-2 h-4 w-4" /> Edit Information</Button>
          <Button onClick={() => onGenerate(resumeData)} disabled={isLoading} className="w-full sm:w-auto">
            <Bot className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
      </CardFooter>
    </Card>
  )
}

const TemplateRenderer = ({
    resume,
    onAcceptEdit,
    targetJob,
    style
}: {
    resume: GeneratedResumeData;
    onAcceptEdit: (fieldPath: string, newValue: string) => void;
    targetJob: string | undefined;
    style: ResumeData['resume_style'];
}) => {
    const templateProps = { resume, onAcceptEdit, targetJob };

    switch (style) {
        case "Minimalist":
            return <MinimalistTemplate {...templateProps} />;
        case "Creative":
            return <CreativeTemplate {...templateProps} />;
        case "Modern":
        default:
            return <ModernTemplate {...templateProps} />;
    }
};

const CoverLetterContent = ({
  content,
  onAcceptEdit,
  targetJob,
}: {
  content: string;
  onAcceptEdit: (fieldPath: string, newValue: string) => void;
  targetJob?: string;
}) => {
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="prose prose-sm max-w-none prose-p:mb-4 dark:prose-invert">
        <EditableField
          as="div"
          value={content}
          onAccept={(fieldPath, newValue) => onAcceptEdit('coverLetter', newValue)}
          fieldPath="coverLetter" // This path corresponds to the `result` object key
          targetJob={targetJob}
          className="whitespace-pre-wrap font-serif"
        >
          {content}
        </EditableField>
      </div>
    </div>
  );
};


export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate, onAcceptEdit }: ResumePreviewProps) {
  const [activeTab, setActiveTab] = React.useState("preview");

  const handlePrint = () => {
    if (!result || !resumeData) return;

    let printContainer = document.getElementById('printable-content');
    if (!printContainer) {
      printContainer = document.createElement('div');
      printContainer.id = 'printable-content';
      document.body.appendChild(printContainer);
    }
    
    const root = createRoot(printContainer);

    // For printing, we don't need the edit functionality
    const printOnAcceptEdit = () => {};

    const contentToPrint = activeTab === 'preview'
      ? <TemplateRenderer resume={result.resume} onAcceptEdit={printOnAcceptEdit} targetJob={undefined} style={resumeData.resume_style} />
      : <CoverLetterContent content={result.coverLetter} onAcceptEdit={printOnAcceptEdit} targetJob={undefined} />;

    root.render(contentToPrint);

    setTimeout(() => {
        window.print();
        root.unmount();
        if (printContainer) {
            printContainer.remove();
        }
    }, 500);
  };

  const wrapperClasses = cn(
    "transition-all duration-300",
    "bg-background/60 backdrop-blur-xl border rounded-xl shadow-lg",
  );
  
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (result && resumeData) {
    return (
      <div className={wrapperClasses}>
          <Tabs defaultValue="preview" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-1 h-auto md:h-12 md:grid-cols-3 rounded-t-xl rounded-b-none border-b bg-transparent p-2">
              <TabsTrigger value="preview" className="gap-2 text-base">
                  <FileText /> Resume
              </TabsTrigger>
              <TabsTrigger value="cover-letter" className="gap-2 text-base">
                  <FileSignature /> Cover Letter
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-2 text-base">
                  <Wand2 /> AI Suggestions
              </TabsTrigger>
              </TabsList>
              <div className="p-2 sm:p-4">
                  <TabsContent value="preview">
                      <div id="resume-container" className="bg-white aspect-[8.5/11] overflow-y-auto rounded-lg shadow-inner">
                            <TemplateRenderer 
                                resume={result.resume}
                                onAcceptEdit={onAcceptEdit}
                                targetJob={resumeData.jobDescription}
                                style={resumeData.resume_style}
                            />
                      </div>
                      <div className="mt-4 flex justify-end gap-2 print-hidden">
                          <Button onClick={onEdit} size="sm" variant="outline"><Pencil /> Edit</Button>
                          <Button onClick={handlePrint} size="sm"><Download /> Download PDF</Button>
                      </div>
                  </TabsContent>

                  <TabsContent value="cover-letter">
                      <div id="cover-letter-content" className="bg-white aspect-[8.5/11] overflow-y-auto rounded-lg shadow-inner">
                         <CoverLetterContent 
                            content={result.coverLetter}
                            onAcceptEdit={onAcceptEdit}
                            targetJob={resumeData.jobDescription}
                         />
                      </div>
                      <div className="mt-4 flex justify-end gap-2 print-hidden">
                          <Button onClick={onEdit} size="sm" variant="outline"><Pencil /> Edit</Button>
                          <Button onClick={handlePrint} size="sm"><Download /> Download PDF</Button>
                      </div>
                  </TabsContent>

                  <TabsContent value="suggestions">
                      <Card className="bg-white">
                          <CardHeader>
                          <CardTitle className="flex items-center gap-2 text-lg">
                              <Wand2 className="h-5 w-5" />
                              AI Suggestions
                          </CardTitle>
                          </CardHeader>
                          <CardContent className="p-6">
                          <div
                              className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1"
                              dangerouslySetInnerHTML={{ __html: result.suggestions }}
                          />
                          </CardContent>
                      </Card>
                  </TabsContent>
              </div>
          </Tabs>
      </div>
    );
  }

  if (isReviewing && resumeData) {
    return <ReviewScreen resumeData={resumeData} onEdit={onEdit} onGenerate={onGenerate} isLoading={isLoading} />;
  }
  
  return <Placeholder />;
}
