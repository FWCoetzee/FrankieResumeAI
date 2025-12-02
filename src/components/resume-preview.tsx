
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, User, Briefcase, GraduationCap, Star, FolderGit, Award, Pencil, Bot, FileSignature } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface ResumePreviewProps {
  result: { resume: string; suggestions: string; coverLetter: string; } | null;
  isLoading: boolean;
  resumeData: ResumeData | null;
  isReviewing: boolean;
  onEdit: () => void;
  onGenerate: (data: ResumeData) => void;
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
  <Card className="flex items-center justify-center h-[500px] lg:h-full">
    <div className="text-center text-muted-foreground p-8">
      <FileText className="mx-auto h-12 w-12 mb-4" />
      <h3 className="text-lg font-semibold">Your resume will appear here</h3>
      <p className="text-sm">Fill out the form and click "Review & Generate" to see the result.</p>
    </div>
  </Card>
);

const ReviewSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
  <div className="space-y-4">
    <div className="flex items-center gap-3">
      {icon}
      <h4 className="font-semibold text-lg border-b-2 border-primary pb-1">{title}</h4>
    </div>
    <div className="pl-8 space-y-4 text-sm">
      {children}
    </div>
  </div>
)

const ReviewScreen = ({ resumeData, onEdit, onGenerate, isLoading }: { resumeData: ResumeData, onEdit: () => void, onGenerate: (data: ResumeData) => void, isLoading: boolean }) => {
  const { personal_info, work_experience, education, skills, projects, certifications, target_job_title } = resumeData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>This is a preview of the data that will be sent to the AI. Review it, then generate your documents.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm max-h-[60vh] overflow-y-auto p-6 bg-background rounded-md border">
        
        {/* Header Section */}
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
                <h3 className="text-md font-semibold text-center">Summary</h3>
                <p className="text-center text-sm text-pretty">{personal_info.summary}</p>
            </div>
        )}
        
        <Separator />
        
        {Array.isArray(skills) && skills.length > 0 && (
           <ReviewSection icon={<Star className="h-5 w-5 text-primary" />} title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
              </div>
            </ReviewSection>
        )}

        {work_experience.length > 0 && (
          <ReviewSection icon={<Briefcase className="h-5 w-5 text-primary" />} title="Work Experience">
            {work_experience.map((job, index) => (
              <div key={index} className="space-y-1.5">
                <div className="flex justify-between items-baseline">
                    <p className="font-semibold">{job.job_title} at {job.company}</p>
                    <p className="text-xs text-muted-foreground">{job.start_date} - {job.end_date}</p>
                </div>
                {job.responsibilities && <p className="text-pretty pl-4 text-muted-foreground"> {job.responsibilities}</p>}
                {job.achievements && <p className="text-pretty pl-4"><strong>Achievements:</strong> {job.achievements}</p>}
              </div>
            ))}
          </ReviewSection>
        )}
        
        {education.length > 0 && (
           <ReviewSection icon={<GraduationCap className="h-5 w-5 text-primary" />} title="Education">
              {education.map((edu, index) => (
                <div key={index} className="space-y-1 flex justify-between items-baseline">
                  <div>
                    <p className="font-semibold">{edu.degree}</p>
                    <p className="text-muted-foreground">{edu.institution}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{edu.start_year} - {edu.end_year}</p>
                </div>
              ))}
            </ReviewSection>
        )}

        {Array.isArray(projects) && projects.length > 0 && (
          <ReviewSection icon={<FolderGit className="h-5 w-5 text-primary" />} title="Projects">
            {projects.map((proj, index) => (
              <div key={index} className="space-y-1.5">
                <p className="font-semibold">{proj.title}</p>
                {proj.description && <p className="text-pretty text-muted-foreground">{proj.description}</p>}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 &&
                  <div className="flex flex-wrap gap-1 pt-1">
                    {proj.technologies.map((tech, i) => <Badge key={i} variant="outline">{tech}</Badge>)}
                  </div>
                }
              </div>
            ))}
          </ReviewSection>
        )}

        {Array.isArray(certifications) && certifications.length > 0 && (
           <ReviewSection icon={<Award className="h-5 w-5 text-primary" />} title="Certifications">
              <div className="flex flex-wrap gap-2">
                {certifications.map((cert, index) => <Badge key={index} variant="secondary">{cert}</Badge>)}
              </div>
            </ReviewSection>
        )}

      </CardContent>
       <CardFooter className="flex justify-end gap-2">
          <Button variant="outline" onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit Information</Button>
          <Button onClick={() => onGenerate(resumeData)} disabled={isLoading}>
            <Bot className="mr-2 h-4 w-4" />
            Generate with AI
          </Button>
      </CardFooter>
    </Card>
  )
}

export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate }: ResumePreviewProps) {

  const handlePrint = (content: string, styles?: string) => {
    if (!content) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><style>${styles || ''}</style></head><body>${content}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (result) {
    const coverLetterPrintStyles = `
      body { font-family: sans-serif; line-height: 1.6; color: #333; }
      p { margin-bottom: 1em; }
    `;
    return (
      <Tabs defaultValue="preview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="preview" className="gap-2">
            <FileText className="h-4 w-4" /> Resume
          </TabsTrigger>
          <TabsTrigger value="cover-letter" className="gap-2">
            <FileSignature className="h-4 w-4" /> Cover Letter
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <Wand2 className="h-4 w-4" /> AI Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="preview" className="mt-4">
          <Card className="overflow-hidden">
            <div className="aspect-[8.5/11] bg-white">
              <iframe
                srcDoc={result.resume}
                className="w-full h-full border-0"
                title="Resume Preview"
                sandbox="allow-scripts"
              />
            </div>
            <CardFooter className="p-4 flex-row-reverse">
              <Button onClick={() => handlePrint(result.resume)} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={onEdit} size="sm" variant="outline" className="mr-2">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="cover-letter" className="mt-4">
          <Card className="overflow-hidden">
            <div className="aspect-[8.5/11] bg-white text-black p-8 md:p-12 overflow-y-auto">
                 <div
                    className="prose prose-sm max-w-none prose-p:mb-4"
                    dangerouslySetInnerHTML={{ __html: result.coverLetter }}
                  />
            </div>
            <CardFooter className="p-4 flex-row-reverse">
               <Button onClick={() => handlePrint(result.coverLetter, coverLetterPrintStyles)} size="sm">
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </Button>
              <Button onClick={onEdit} size="sm" variant="outline" className="mr-2">
                  <Pencil className="mr-2 h-4 w-4" /> Edit
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Wand2 className="h-5 w-5" />
                AI Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div
                className="prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-ul:my-2"
                dangerouslySetInnerHTML={{ __html: result.suggestions }}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    );
  }

  if (isReviewing && resumeData) {
    return <ReviewScreen resumeData={resumeData} onEdit={onEdit} onGenerate={onGenerate} isLoading={isLoading} />;
  }
  
  return <Placeholder />;
}

    