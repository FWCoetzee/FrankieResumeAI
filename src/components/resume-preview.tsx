"use client";

import * as React from "react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, Pencil, Bot, FileSignature, Linkedin, Loader2, BookOpen, Sparkles } from "lucide-react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import type { TailoringAnalysis } from '@/ai/flows/analyze-tailoring';
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ModernTemplate } from "./templates/modern-template";
import { MinimalistTemplate } from "./templates/minimalist-template";
import { CreativeTemplate } from "./templates/creative-template";
import { LinkedInPreview } from "./linkedin-preview";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/use-user-profile";
import { AdBanner } from "./ad-banner";

const AiEditor = dynamic(() => import("./ai-editor").then((module) => module.AiEditor), {
  ssr: false,
});


interface ResumePreviewProps {
  result: { 
    resume?: GeneratedResumeData; 
    suggestions?: string; 
    coverLetter?: string;
    linkedin?: GenerateLinkedInProfileOutput;
    tailoring?: TailoringAnalysis;
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

const AiEditorSkeleton = () => (
  <div className="space-y-4 p-4 bg-white rounded-lg">
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-10 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-24 w-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-4 w-32" />
      <div className="grid grid-cols-2 gap-2">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-10 w-full" />
        ))}
      </div>
    </div>
  </div>
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
        <p className="rounded-md border bg-background px-4 py-3 text-sm text-muted-foreground">
          To protect the service from abuse by malicious users and automated bots, AI generation is rate-limited. Please submit requests responsibly. If you believe you have been limited in error, report the issue here.
        </p>
        
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
          <Button onClick={onEdit} className="w-full sm:w-auto"><Pencil className="mr-2 h-4 w-4" /> Edit Information</Button>
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

const TailoringView = ({ analysis }: { analysis: { requirement: string, implementation: string }[] }) => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          Tailoring Analysis
        </h3>
        <p className="text-sm text-muted-foreground">How we optimized your resume for this specific role</p>
      </div>
      <div className="grid gap-3">
        {analysis.map((point, index) => (
          <Card key={index} className="bg-muted/30 border-l-4 border-l-primary">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-start gap-2">
                <Badge variant="outline" className="shrink-0">Requirement</Badge>
                <p className="text-sm font-semibold">{point.requirement}</p>
              </div>
              <div className="flex items-start gap-2">
                <Badge variant="secondary" className="shrink-0">Implementation</Badge>
                <p className="text-sm text-muted-foreground">{point.implementation}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate, onAcceptEdit }: ResumePreviewProps) {
  const [activeTab, setActiveTab] = React.useState("preview");
  const [isDownloading, setIsDownloading] = React.useState(false);
  const { toast } = useToast();
  const { profile } = useUserProfile();

  const handleCardCheckout = async () => {
    if (!resumeData?.resumeId) {
      toast({
        variant: "destructive",
        title: "Payment unavailable",
        description: "Save the resume before starting card payment.",
      });
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeId: resumeData.resumeId,
          paymentMethod: 'card',
        }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok || !body.checkoutUrl) {
        throw new Error(body.error || 'Card checkout could not be started.');
      }

      window.location.assign(body.checkoutUrl);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Card checkout failed",
        description: error instanceof Error ? error.message : 'Please try again.',
      });
      setIsDownloading(false);
    }
  };

  const handleDownloadPdf = async () => {
    const elementId = activeTab === 'preview' ? 'resume-content' : 'cover-letter-content';
    const elementToCapture = document.getElementById(elementId);

    if (!elementToCapture) {
      toast({
        variant: "destructive",
        title: "Download Failed",
        description: `Could not find the content element with ID: ${elementId}`,
      });
      return;
    }

    setIsDownloading(true);
    toast({
      title: "Generating PDF...",
      description: "Please wait while your document is being prepared.",
    });

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);
      const canvas = await html2canvas(elementToCapture, {
        scale: 2,
        useCORS: true,
        logging: false,
        height: elementToCapture.scrollHeight,
        width: elementToCapture.scrollWidth,
        windowHeight: elementToCapture.scrollHeight,
        windowWidth: elementToCapture.scrollWidth,
      });

      // Add watermark if user is on the free plan
      if (profile && profile.plan === 'free') {
          const ctx = canvas.getContext('2d');
          if (ctx) {
              ctx.save();
              ctx.globalAlpha = 0.08;
              ctx.fillStyle = 'black';
              ctx.font = 'bold 72px Inter, sans-serif';
              ctx.textAlign = 'center';
              ctx.translate(canvas.width / 2, canvas.height / 2);
              ctx.rotate(-0.5); // ~30 degrees
              ctx.fillText('Created with DeepResumeAI', 0, 0);
              ctx.restore();
          }
      }

      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = 297; // A4 height in mm
      const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const imgProps = pdf.getImageProperties(imgData);
      const ratio = imgProps.height / imgProps.width;
      const finalImgWidth = pdfWidth;
      const finalImgHeight = pdfWidth * ratio;
      let position = 0;
      let heightLeft = finalImgHeight;

      pdf.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - finalImgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, finalImgWidth, finalImgHeight);
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
              <TabsList className="grid w-full grid-cols-1 h-auto md:h-12 md:grid-cols-6 rounded-t-xl rounded-b-none border-b bg-transparent p-2">
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
              <TabsTrigger value="tailoring" className="gap-2 text-base" disabled={!result.tailoring}>
                  <Sparkles /> Tailoring
              </TabsTrigger>
              </TabsList>
              <div className="p-2 sm:p-4">
                  <TabsContent value="preview">
                    {result.resume && (
                        <>
                        {profile && profile.plan === 'free' && <AdBanner className="mb-4" />}
                        <p className="mb-4 rounded-md border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
                          To protect the service from abuse by malicious users and automated bots, AI generation is rate-limited. Please submit requests responsibly. If you believe you have been limited in error, report the issue here.
                        </p>
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <div id="resume-content" className="overflow-y-auto bg-white rounded-lg shadow-inner mx-auto max-w-full aspect-[8.5/11]">
                              <TemplateRenderer 
                                  resume={result.resume}
                                  style={resumeData.templateId}
                              />
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-end gap-2">
                          <Button onClick={onEdit} size="sm"><Pencil /> Edit Form</Button>
                          <Button onClick={handleCardCheckout} size="sm" variant="outline" disabled={isDownloading}>
                            <Download /> Pay by card
                          </Button>
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
                        {profile && profile.plan === 'free' && <AdBanner className="mb-4" />}
                        <div className="bg-gray-200 p-4 rounded-lg">
                          <div id="cover-letter-content" className="bg-white aspect-[8.5/11] overflow-y-auto rounded-lg shadow-inner mx-auto max-w-full">
                                <CoverLetterContent content={result.coverLetter} />
                          </div>
                        </div>

                        <div className="mt-4 flex justify-end gap-2">
                            <Button onClick={onEdit} size="sm"><Pencil /> Edit Form</Button>
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
                            <Button onClick={onEdit} size="sm"><Pencil /> Edit Form</Button>
                        </div>
                  </TabsContent>

                  <TabsContent value="ai-editor">
                    {isLoading ? (
                      <AiEditorSkeleton />
                    ) : (
                      <AiEditor 
                          result={result as any}
                          resumeData={resumeData}
                          onAcceptEdit={onAcceptEdit}
                      />
                    )}
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

                  <TabsContent value="tailoring">
                    {result.tailoring && (
                      <TailoringView analysis={result.tailoring} />
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
