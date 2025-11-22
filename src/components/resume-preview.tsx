
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, User, Briefcase, GraduationCap, Star, FolderGit, Award, Pencil, Bot } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface ResumePreviewProps {
  result: { resume: string; suggestions: string } | null;
  isLoading: boolean;
  resumeData: ResumeData | null;
  isReviewing: boolean;
  onEdit: () => void;
  onGenerate: (data: ResumeData) => void;
  userId?: string | null;
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
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      {icon}
      <h4 className="font-semibold text-md">{title}</h4>
    </div>
    <div className="pl-8 space-y-4 text-sm text-muted-foreground">
      {children}
    </div>
    <Separator />
  </div>
)

const ReviewScreen = ({ resumeData, onEdit, onGenerate, isLoading }: { resumeData: ResumeData, onEdit: () => void, onGenerate: (data: ResumeData) => void, isLoading: boolean }) => {
  const { personal_info, work_experience, education, skills, projects, certifications, target_job_title } = resumeData;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
        <CardDescription>This is a preview of the data that will be sent to the AI. Review it, then generate your resume.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 text-sm max-h-[60vh] overflow-y-auto pr-6">
        
        <ReviewSection icon={<User className="h-5 w-5 text-primary" />} title="Personal Info">
            <p><strong>Name:</strong> {personal_info.full_name}</p>
            <p><strong>Target Role:</strong> {target_job_title}</p>
            <p><strong>Contact:</strong> {personal_info.email} | {personal_info.phone}</p>
            {personal_info.location && <p><strong>Location:</strong> {personal_info.location}</p>}
            {personal_info.summary && <p className="text-pretty"><strong>Summary:</strong> {personal_info.summary}</p>}
        </ReviewSection>
        
        {work_experience.length > 0 && (
          <ReviewSection icon={<Briefcase className="h-5 w-5 text-primary" />} title="Work Experience">
            {work_experience.map((job, index) => (
              <div key={index} className="space-y-1">
                <p className="font-semibold">{job.job_title} at {job.company}</p>
                <p className="text-xs">{job.start_date} - {job.end_date}</p>
                {job.responsibilities && <p className="text-pretty"><em>Responsibilities:</em> {job.responsibilities}</p>}
                {job.achievements && <p className="text-pretty"><em>Achievements:</em> {job.achievements}</p>}
              </div>
            ))}
          </ReviewSection>
        )}
        
        {education.length > 0 && (
           <ReviewSection icon={<GraduationCap className="h-5 w-5 text-primary" />} title="Education">
              {education.map((edu, index) => (
                <div key={index} className="space-y-1">
                  <p className="font-semibold">{edu.degree}</p>
                  <p>{edu.institution} ({edu.start_year} - {edu.end_year})</p>
                </div>
              ))}
            </ReviewSection>
        )}
        
        {Array.isArray(skills) && skills.length > 0 && (
           <ReviewSection icon={<Star className="h-5 w-5 text-primary" />} title="Skills">
              <div className="flex flex-wrap gap-2">
                {skills.map((skill, index) => <Badge key={index} variant="secondary">{skill}</Badge>)}
              </div>
            </ReviewSection>
        )}

        {Array.isArray(projects) && projects.length > 0 && (
          <ReviewSection icon={<FolderGit className="h-5 w-5 text-primary" />} title="Projects">
            {projects.map((proj, index) => (
              <div key={index} className="space-y-1">
                <p className="font-semibold">{proj.title}</p>
                {proj.description && <p className="text-pretty">{proj.description}</p>}
                {Array.isArray(proj.technologies) && proj.technologies.length > 0 &&
                  <div className="flex flex-wrap gap-1">
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

export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate, userId }: ResumePreviewProps) {

  const handlePrint = () => {
    if (!result?.resume) return;
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(result.resume);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isReviewing && resumeData) {
    return <ReviewScreen resumeData={resumeData} onEdit={onEdit} onGenerate={onGenerate} isLoading={isLoading} />;
  }
  
  if (!result) {
    return <Placeholder />;
  }


  return (
    <Tabs defaultValue="preview" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="preview" className="gap-2">
          <FileText className="h-4 w-4" /> Resume Preview
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
              sandbox="allow-scripts" // Added for security, though srcDoc is generally safe
            />
          </div>
          <CardFooter className="p-4 flex-row-reverse">
            <Button onClick={handlePrint} size="sm">
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
