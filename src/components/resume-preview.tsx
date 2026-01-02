
"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, Pencil, Bot, FileSignature, Linkedin, Loader2, BookOpen } from "lucide-react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { CreativeTemplate } from "./templates/creative-template";
import { LinkedInPreview } from "./linkedin-preview";
import { cn } from "@/lib/utils";
import { AiEditor } from "./ai-editor";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useToast } from "@/hooks/use-toast";


interface ResumePreviewProps {
  result: { 
    resume?: GeneratedResumeData; 
    suggestions?: string; 
    coverLetter?: string;
    linkedin?: GenerateLinkedInProfileOutput;
  } | null;
  isLoading: boolean;
  resumeData: ResumeData | null;
  isReviewing: boolean;
  onEdit: () => void;
  onGenerate: () => void;
  onAcceptEdit: (fieldPath: string, newValue: string | string[]) => void;
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

const ReviewScreen = ({ resumeData, onEdit, onGenerate, isLoading }: { resumeData: ResumeData, onEdit: () => void, onGenerate: () => void, isLoading: boolean }) => {
  const { title, sections } = resumeData;

  return (
    <Card className="shadow-lg backdrop-blur-sm bg-card/80">
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>This is a preview of the data that will be sent to the AI. Review it, then generate your documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm max-h-[60vh] overflow-y-auto p-6 bg-muted/50 rounded-md border">
        
        <div className="text-center mb-6">
            <h2 className="text-2xl font-bold">{title}</h2>
        </div>

        {sections.summary?.content && (
            <div className="space-y-2">
                <h3 className="text-md font-semibold text-center uppercase tracking-wider text-muted-foreground">Summary</h3>
                <p className="text-center text-sm text-pretty">{sections.summary.content}</p>
            </div>
        )}
        
        <Separator />
        
        {Array.isArray(sections.skills) && sections.skills.length > 0 && (
           <div className="space-y-2">
              <h3 className="font-semibold text-md">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {sections.skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
              </div>
            </div>
        )}

        {sections.experience && sections.experience.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-md">Work Experience</h3>
            {sections.experience.map((job, index) => (
              <div key={job.id || index} className="space-y-1.5 pl-4">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{job.role} at {job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.startDate ? new Date(job.startDate).toLocaleDateString() : ''} - {job.endDate ? new Date(job.endDate).toLocaleDateString() : 'Present'}</p>
                </div>
                 {job.bullets && job.bullets.length > 0 && 
                    <ul className="list-disc pl-5">
                      {job.bullets.map((bullet, i) => <li key={i} className="text-pretty">{bullet}</li>)}
                    </ul>
                  }
              </div>
            ))}
          </div>
        )}

        {sections.education && sections.education.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-md">Education</h3>
            {sections.education.map((edu, index) => (
              <div key={edu.id || index} className="space-y-1.5 pl-4">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{edu.degree} from {edu.institution}</p>
                    <p className="text-xs text-muted-foreground">{edu.startYear} - {edu.endYear}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {sections.projects && sections.projects.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-semibold text-md">Projects</h3>
            {sections.projects.map((proj, index) => (
              <div key={proj.id || index} className="space-y-1.5 pl-4">
                 <p className="font-semibold">{proj.title}</p>
                 <p className="text-pretty">{proj.description}</p>
              </div>
            ))}
          </div>
        )}

      </CardContent>
       <CardFooter className="flex-col sm:flex-row sm:justify-end gap-2 pt-6">
          <Button variant="outline" onClick={onEdit} className="w-full sm:w-auto"><Pencil className="mr-2 h-4 w-4" /> Edit Information</Button>
          <Button onClick={onGenerate} disabled={isLoading} className="w-full sm:w-auto">
            <Bot className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
      </CardFooter>
    </Card>
  )
}

const TemplateRenderer = ({
    resume,
    style
}: {
    resume: GeneratedResumeData;
    style: string;
}) => {
    const templateProps = { resume };

    switch (style) {
        case "minimalist":
            return <MinimalistTemplate {...templateProps} />;
        case "creative":
            return <CreativeTemplate {...templateProps} />;
        case "modern":
        default:
            return <ModernTemplate {...templateProps} />;
    }
};

const CoverLetterContent = ({ content }: { content: string }) => {
  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      <div className="prose prose-sm max-w-none prose-p:mb-4 dark:prose-invert">
        <div className="whitespace-pre-wrap font-serif">
            {content}
        </div>
      </div>
    </div>
  );
};


export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate, onAcceptEdit }: ResumePreviewProps) {
  const [activeTab, setActiveTab] = React.useState("preview");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();

  const handleDownloadPdf = async () => {
    const elementToCapture = document.getElementById(
      activeTab === 'preview' ? 'resume-content' : 'cover-letter-content'
    );

    if (!elementToCapture) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: "Could not find the content to download.",
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Generating PDF...",
      description: "Please wait while your document is being prepared.",
    });

    try {
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        useCORS: true,
        logging: false,
        height: elementToCapture.scrollHeight,
        width: elementToCapture.scrollWidth,
        windowHeight: elementToCapture.scrollHeight,
        windowWidth: elementToCapture.scrollWidth,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = imgHeight / imgWidth;
      const finalImgHeight = pdfWidth * ratio;

      let position = 0;
      let heightLeft = finalImgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - finalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, finalImgHeight);
        heightLeft -= pdfHeight;
      }
      
      const fileName = activeTab === 'preview' 
        ? `${resumeData?.title?.replace(/ /g, '_') || 'resume'}.pdf` 
        : `cover-letter.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("PDF Generation Error:", error);
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred during PDF generation.",
      });
    } finally {
      setIsDownloading(false);
    }
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
              <TabsList className="grid w-full grid-cols-1 h-auto md:h-12 md:grid-cols-5 rounded-t-xl rounded-b-none border-b bg-transparent p-2">
              <TabsTrigger value="preview" className="gap-2 text-base" disabled={!result.resume}>
                  <FileText /> Resume
              </TabsTrigger>
              <TabsTrigger value="cover-letter" className="gap-2 text-base" disabled={!result.coverLetter}>
                  <FileSignature /> Cover Letter
              </TabsTrigger>
               <TabsTrigger value="linkedin" className="gap-2 text-base" disabled={!result.linkedin}>
                  <Linkedin /> LinkedIn
              </TabsTrigger>
              <TabsTrigger value="ai-editor" className="gap-2 text-base">
                <Wand2 /> AI Editor
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="gap-2 text-base" disabled={!result.suggestions}>
                  <BookOpen /> Suggestions
              </TabsTrigger>
              </TabsList>
              <div className="p-2 sm:p-4">
                  <TabsContent value="preview">
                    {result.resume && (
                        <>
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <div id="resume-container-for-pdf" className="overflow-y-auto rounded-lg shadow-inner mx-auto max-w-full w-full aspect-[8.5/11]">
                              <div id="resume-content">
                                <TemplateRenderer 
                                    resume={result.resume}
                                    style={resumeData.templateId}
                                />
                              </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                          <Button onClick={onEdit} size="sm" variant="outline"><Pencil /> Edit Form</Button>
                          <Button onClick={handleDownloadPdf} size="sm" disabled={isDownloading}>
                            {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                            {isDownloading ? "Downloading..." : "Download PDF"}
                          </Button>
                        </div>
                        </>
                    )}
                  </TabsContent>

                  <TabsContent value="cover-letter">
                    {result.coverLetter && (
                        <>
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <div id="cover-letter-container-for-pdf" className="bg-white aspect-[8.5/11] overflow-y-auto rounded-lg shadow-inner mx-auto max-w-full w-[8.5in]">
                              <div id="cover-letter-content">
                                <CoverLetterContent content={result.coverLetter} />
                              </div>
                          </div>
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <Button onClick={onEdit} size="sm" variant="outline"><Pencil /> Edit Form</Button>
                            <Button onClick={handleDownloadPdf} size="sm" disabled={isDownloading}>
                                {isDownloading ? <Loader2 className="animate-spin" /> : <Download />}
                                {isDownloading ? "Downloading..." : "Download PDF"}
                            </Button>
                        </div>
                        </>
                    )}
                  </TabsContent>
                  
                   <TabsContent value="linkedin">
                        {result.linkedin && <LinkedInPreview content={result.linkedin} />}
                         <div className="mt-4 flex justify-end gap-2">
                            <Button onClick={onEdit} size="sm" variant="outline"><Pencil /> Edit Form</Button>
                        </div>
                  </TabsContent>

                  <TabsContent value="ai-editor">
                    <AiEditor 
                        result={result as any}
                        resumeData={resumeData}
                        onAcceptEdit={onAcceptEdit}
                    />
                  </TabsContent>

                  <TabsContent value="suggestions">
                    {result.suggestions && (
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
                    )}
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
