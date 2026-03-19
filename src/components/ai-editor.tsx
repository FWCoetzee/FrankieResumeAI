
"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Check, X, Sparkles, Wand2, CaseSensitive, Pilcrow, PencilLine, Languages, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpWideNarrow, SpellCheck, Trophy, WholeWord } from "lucide-react";
import { editResumeText, type EditResumeTextInput } from "@/ai/flows/edit-resume-text";
import { useToast } from "@/hooks/use-toast";
import type { ResumeData, GeneratedResumeData } from "@/lib/schema";
import { type GenerateLinkedInProfileOutput } from "@/ai/flows/generate-linkedin-profile";
import { get, set, cloneDeep } from "lodash";

type EditMode = EditResumeTextInput["mode"];
type Tone = NonNullable<EditResumeTextInput["tone"]>;
type Length = NonNullable<EditResumeTextInput["length"]>;

const editModes: { id: EditMode; label: string; icon: React.ReactNode, hasTone?: boolean, hasLength?: boolean }[] = [
  { id: "Rewrite", label: "Rewrite", icon: <PencilLine /> },
  { id: "Strengthen", label: "Strengthen", icon: <Trophy /> },
  { id: "Shorten", label: "Shorten", icon: <ArrowDownWideNarrow /> },
  { id: "Expand", label: "Expand", icon: <ArrowUpWideNarrow /> },
  { id: "Bullet Conversion", label: "To Bullets", icon: <Wand2 /> },
  { id: "Paragraph", label: "To Paragraph", icon: <Pilcrow /> },
  { id: "Job-Align", label: "Align to Job", icon: <SlidersHorizontal /> },
  { id: "Tone", label: "Change Tone", icon: <CaseSensitive />, hasTone: true },
  { id: "Grammar Fix", label: "Fix Grammar", icon: <SpellCheck /> },
  { id: "Summarize", label: "Summarize", icon: <WholeWord /> },
  { id: "Length Control", label: "Set Length", icon: <Languages />, hasLength: true },
];

const tones: Tone[] = ["Professional", "Formal", "Modern", "Confident", "Simple", "Executive", "Technical", "Friendly", "Minimalistic"];
const lengths: Length[] = ["short", "medium", "long"];

interface AiEditorProps {
  result: {
    resume: GeneratedResumeData;
    coverLetter: string;
    linkedin: GenerateLinkedInProfileOutput;
  };
  resumeData: ResumeData | null;
  onAcceptEdit: (fieldPath: string, newValue: string) => void;
}

export function AiEditor({ result, resumeData, onAcceptEdit }: AiEditorProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [selectedField, setSelectedField] = useState<string>("resume.summary");
  const { toast } = useToast();

  const targetJob = resumeData?.jobDescription;

  const editableFields = useMemo(() => {
    const fields = [
      { path: 'resume.summary', label: 'Resume: Summary' },
      { path: 'coverLetter', label: 'Cover Letter' },
      { path: 'linkedin.summary', label: 'LinkedIn: Summary' },
    ];

    result.resume.experience.forEach((_, i) => {
      fields.push({ path: `resume.experience[${i}].bulletPoints`, label: `Resume Exp ${i + 1}: Bullet Points` });
    });
     result.resume.projects?.forEach((_, i) => {
      fields.push({ path: `resume.projects[${i}].description`, label: `Resume Proj ${i + 1}: Description` });
    });
     result.linkedin.experience.forEach((_, i) => {
      fields.push({ path: `linkedin.experience[${i}].description`, label: `LinkedIn Exp ${i + 1}: Description` });
    });

    return fields;
  }, [result]);

  const originalContent = useMemo(() => {
    let content = get(result, selectedField);
    if (Array.isArray(content)) {
        content = content.join('\n');
    }
    return content as string || '';
  }, [result, selectedField]);


  const handleAiAction = async (
    mode: EditMode,
    tone?: Tone,
    length?: Length
  ) => {
    if (!originalContent) {
        toast({
            variant: "destructive",
            title: "No Content",
            description: "There is no content to edit.",
        });
        return;
    }
    setIsLoading(true);
    setGeneratedContent(null);
    try {
      const input: EditResumeTextInput = {
        mode,
        content: originalContent,
        targetJob,
        tone: mode === "Tone" ? tone : undefined,
        length: mode === "Length Control" ? length : undefined,
      };
      const result = await editResumeText(input);
      setGeneratedContent(result);
    } catch (error) {
      console.error("AI Edit Error:", error);
      toast({
        variant: "destructive",
        title: "AI Edit Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = () => {
    if (generatedContent) {
        let valueToSet: string | string[] = generatedContent;
        const originalValue = get(result, selectedField);
        if(Array.isArray(originalValue)){
            valueToSet = generatedContent.split('\n').filter(Boolean);
        }

        onAcceptEdit(selectedField, valueToSet as any);
        setGeneratedContent(null);
    }
  };
  
  const handleDiscard = () => {
    setGeneratedContent(null);
  };

  const ModeButton = ({ mode, label, icon }: { mode: EditMode, label: string, icon: React.ReactNode }) => {
    const config = editModes.find(m => m.id === mode);
    const [selectedTone, setSelectedTone] = useState<Tone>("Professional");
    const [selectedLength, setSelectedLength] = useState<Length>("medium");

    const handleClick = () => {
      handleAiAction(mode, selectedTone, selectedLength);
    };

    if (config?.hasTone || config?.hasLength) {
        return (
            <div className="flex flex-col space-y-2">
                <Button
                    size="sm"
                    className="w-full justify-start gap-2"
                    onClick={handleClick}
                >
                    {icon}
                    {label}
                </Button>
                {config?.hasTone && (
                    <Select value={selectedTone} onValueChange={(v) => setSelectedTone(v as Tone)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select tone..." /></SelectTrigger>
                        <SelectContent>
                            {tones.map(t => <SelectItem key={t} value={t} className="text-xs">{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
                {config?.hasLength && (
                    <Select value={selectedLength} onValueChange={(v) => setSelectedLength(v as Length)}>
                        <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Select length..." /></SelectTrigger>
                        <SelectContent>
                            {lengths.map(l => <SelectItem key={l} value={l} className="text-xs capitalize">{l}</SelectItem>)}
                        </SelectContent>
                    </Select>
                )}
            </div>
        );
    }
    
    return (
         <Button
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleClick}
            >
            {icon}
            {label}
        </Button>
    )
  };


  return (
    <div className="space-y-4 p-4 bg-white rounded-lg">
      <div className="space-y-2">
        <Label htmlFor="editable-field-select">Content to Edit</Label>
        <Select value={selectedField} onValueChange={setSelectedField}>
          <SelectTrigger id="editable-field-select">
            <SelectValue placeholder="Select a field to edit..." />
          </SelectTrigger>
          <SelectContent>
            {editableFields.map(field => (
              <SelectItem key={field.path} value={field.path}>{field.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs font-semibold text-muted-foreground">Original Content</Label>
        <Textarea 
            value={originalContent} 
            readOnly 
            className="text-sm border rounded-md p-2 bg-muted/50 max-h-24 h-24"
        />
      </div>
      
       {isLoading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="ml-2 text-sm text-muted-foreground">AI is thinking...</p>
        </div>
      )}

      {generatedContent && !isLoading && (
         <div>
            <Label className="text-xs font-semibold text-muted-foreground">AI Suggestion</Label>
            <div className="text-sm border rounded-md p-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 min-h-[96px] whitespace-pre-wrap">{generatedContent}</div>
             <div className="flex justify-end gap-2 mt-2">
                <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={handleDiscard}><X className="h-3 w-3" /> Discard</Button>
                <Button size="sm" className="gap-1 h-7" onClick={handleAccept}><Check className="h-3 w-3" /> Accept</Button>
            </div>
        </div>
      )}
      
      {!isLoading && !generatedContent && (
        <div>
            <Label className="text-xs font-semibold text-muted-foreground">AI Actions</Label>
            <div className="grid grid-cols-2 gap-2 mt-1">
                {editModes.map(mode => (
                <ModeButton key={mode.id} {...mode} />
                ))}
            </div>
        </div>
      )}
      
      {targetJob && <p className="text-xs text-muted-foreground mt-2 border-t pt-2">✨ Aligning to job: "{targetJob.substring(0, 50)}..."</p>}
    </div>
  );
}
