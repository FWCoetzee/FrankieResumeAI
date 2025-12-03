
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download, User, Briefcase, GraduationCap, Star, FolderGit, Award, Pencil, Bot, FileSignature, Link as LinkIcon, Phone, Mail } from "lucide-react";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface ResumePreviewProps {
  result: { resume: GeneratedResumeData; suggestions: string; coverLetter: string; } | null;
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

const GeneratedResume = ({ resume }: { resume: GeneratedResumeData }) => {
  const { header, summary, skills, experience, education, projects } = resume;

  return (
    <div className="bg-white text-black p-8 font-sans text-sm">
      {/* Header */}
      <div className="text-center border-b pb-4 mb-6">
        <h1 className="text-4xl font-bold tracking-tight">{header.name}</h1>
        <div className="flex justify-center items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-2 flex-wrap">
          <a href={`mailto:${header.email}`} className="flex items-center gap-1 hover:text-blue-600"><Mail className="h-3 w-3" />{header.email}</a>
          <span className="text-gray-300 hidden md:inline">|</span>
          <a href={`tel:${header.phone}`} className="flex items-center gap-1 hover:text-blue-600"><Phone className="h-3 w-3" />{header.phone}</a>
          <span className="text-gray-300 hidden md:inline">|</span>
          <p className="flex items-center gap-1">{header.location}</p>
          {header.website && (
            <>
            <span className="text-gray-300 hidden md:inline">|</span>
            <a href={header.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-blue-600">
                <LinkIcon className="h-3 w-3" />{header.website.replace(/https?:\/\//, '')}
            </a>
            </>
          )}
        </div>
      </div>
      
      {/* Summary */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">Professional Summary</h2>
        <p className="text-gray-700 leading-relaxed">{summary}</p>
      </section>

      {/* Skills */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">Core Competencies</h2>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => <Badge key={index} variant="secondary" className="bg-gray-200 text-gray-800 font-medium">{skill}</Badge>)}
        </div>
      </section>
      
      {/* Experience */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">Professional Experience</h2>
        {experience.map((job, index) => (
          <div key={index} className="mb-4 last:mb-0">
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="font-bold text-base">{job.title}</h3>
              <p className="text-xs text-gray-600">{job.dates}</p>
            </div>
            <p className="text-sm font-medium italic text-gray-800">{job.company}</p>
            <ul className="mt-2 list-disc list-inside space-y-1 text-gray-700">
              {job.bulletPoints.map((point, i) => <li key={i}>{point}</li>)}
            </ul>
          </div>
        ))}
      </section>

      {/* Education */}
      <section className="mb-6">
        <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">Education</h2>
        {education.map((edu, index) => (
          <div key={index} className="flex justify-between items-baseline">
            <div>
              <h3 className="font-bold text-base">{edu.degree}</h3>
              <p className="text-sm italic text-gray-800">{edu.institution}</p>
            </div>
            <p className="text-xs text-gray-600">{edu.year}</p>
          </div>
        ))}
      </section>

      {/* Projects */}
      {projects && projects.length > 0 && (
        <section>
          <h2 className="text-sm font-bold uppercase tracking-widest text-blue-800 mb-2 border-b-2 border-gray-200 pb-1">Projects</h2>
          {projects.map((proj, index) => (
            <div key={index} className="mb-3 last:mb-0">
               <h3 className="font-bold text-base">{proj.title}</h3>
               <p className="mt-1 list-disc list-inside space-y-1 text-gray-700">{proj.description}</p>
            </div>
          ))}
        </section>
      )}

    </div>
  )
}

const CoverLetterContent = ({ content }: { content: string }) => {
  const paragraphs = content.split('\n').filter(p => p.trim() !== '');
  return (
    <div className="prose prose-sm max-w-none prose-p:mb-4">
      {paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  );
};


export function ResumePreview({ result, isLoading, resumeData, isReviewing, onEdit, onGenerate }: ResumePreviewProps) {

  const coverLetterPrintStyles = `
    body { font-family: sans-serif; line-height: 1.6; color: #333; }
    p { margin-bottom: 1em; }
  `;

  const resumePrintStyles = `
    body { font-family: sans-serif; color: #333; background-color: #fff; }
    h1, h2, h3 { color: #000; }
    h1 { font-size: 2.25rem; font-weight: bold; }
    h2 { font-size: 0.875rem; font-weight: bold; text-transform: uppercase; letter-spacing: 0.1em; color: #2563eb; margin-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; padding-bottom: 0.25rem; }
    h3 { font-size: 1rem; font-weight: bold; }
    a { color: #3b82f6; text-decoration: none; }
    .badge { display: inline-block; padding: 0.25em 0.5em; font-size: 0.75rem; font-weight: 500; line-height: 1; text-align: center; white-space: nowrap; vertical-align: baseline; border-radius: 0.25rem; background-color: #e5e7eb; color: #1f2937; }
    ul { margin-top: 0.5rem; list-style-position: inside; list-style-type: disc; }
    li { margin-bottom: 0.25rem; }
    section { margin-bottom: 1.5rem; }
    .text-center { text-align: center; }
    .border-b { border-bottom-width: 1px; }
    .pb-4 { padding-bottom: 1rem; }
    .mb-6 { margin-bottom: 1.5rem; }
    .flex { display: flex; }
    .justify-center { justify-content: center; }
    .justify-between { justify-content: space-between; }
    .items-center { align-items: center; }
    .items-baseline { align-items: baseline; }
    .gap-x-4 { column-gap: 1rem; }
    .text-xs { font-size: 0.75rem; }
    .text-sm { font-size: 0.875rem; }
    .text-base { font-size: 1rem; }
    .text-gray-600 { color: #4b5563; }
    .text-gray-700 { color: #374151; }
    .text-gray-800 { color: #1f2937; }
    .mt-2 { margin-top: 0.5rem; }
    .italic { font-style: italic; }
  `;

  const handleDownloadPdf = (contentElementId: string, styles: string, documentTitle: string) => {
    const content = document.getElementById(contentElementId)?.innerHTML;
    if (!content) return;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<html><head><title>${documentTitle}</title><style>${styles}</style></head><body>${content}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      // Use a timeout to allow the content to load before printing
      setTimeout(() => {
        printWindow.print();
        printWindow.close(); // Close the window after printing
      }, 500);
    }
  };


  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (result) {
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
             <div id="resume-container" className="aspect-[8.5/11] bg-white overflow-y-auto">
               <GeneratedResume resume={result.resume} />
            </div>
            <CardFooter className="p-4 flex-row-reverse">
              <Button onClick={() => handleDownloadPdf('resume-container', resumePrintStyles, 'Resume')} size="sm">
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
            <div id="cover-letter-content" className="aspect-[8.5/11] bg-white text-black p-8 md:p-12 overflow-y-auto">
                 <CoverLetterContent content={result.coverLetter} />
            </div>
            <CardFooter className="p-4 flex-row-reverse">
               <Button onClick={() => handleDownloadPdf('cover-letter-content', coverLetterPrintStyles, 'Cover Letter')} size="sm">
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

    