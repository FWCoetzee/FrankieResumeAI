"use client";

import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Wand2, Download } from "lucide-react";
import type { ResumeData } from "@/lib/schema";
import { Button } from "./ui/button";

interface ResumePreviewProps {
  result: { resume: string; suggestions: string } | null;
  isLoading: boolean;
  resumeData: ResumeData | null;
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

const ReviewScreen = ({ resumeData }: { resumeData: ResumeData | null }) => {
  if (!resumeData) return <Placeholder />;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Review Your Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <p className="text-muted-foreground">This is a preview of the data that will be sent to the AI. Once you're ready, the AI will generate your resume and suggestions.</p>
        <div className="max-h-[600px] overflow-auto rounded-lg bg-muted p-4">
          <pre>
            <code>{JSON.stringify(resumeData, null, 2)}</code>
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

export function ResumePreview({ result, isLoading, resumeData }: ResumePreviewProps) {

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

  // Show review screen if no result yet but we have data from the form
  if (!result) {
    return <ReviewScreen resumeData={resumeData} />;
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
          <div className="aspect-[8.5/11]">
            <iframe
              srcDoc={result.resume}
              className="w-full h-full border-0"
              title="Resume Preview"
              sandbox="allow-scripts" // Added for security, though srcDoc is generally safe
            />
          </div>
          <CardFooter className="p-2 justify-end">
            <Button onClick={handlePrint} size="sm">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
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
