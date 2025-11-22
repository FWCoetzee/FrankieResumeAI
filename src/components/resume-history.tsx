
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { History } from "lucide-react";


export function ResumeHistory() {

  return (
    <Card className="mt-8">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <History className="h-6 w-6" />
                Resume History
            </CardTitle>
            <CardDescription>
                Your previously generated resumes are saved here.
            </CardDescription>
        </CardHeader>
        <CardContent>
            <div className="text-center text-muted-foreground p-8">
                <p>No resume history found.</p>
                <p className="text-sm">Generate a resume to see its history here.</p>
            </div>
        </CardContent>
    </Card>
  )
}
