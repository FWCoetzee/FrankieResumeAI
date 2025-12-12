"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MagicWandIcon } from "@/components/icons";
import { Loader2, Check, X, Sparkles, Wand2, CaseSensitive, Pilcrow, PencilLine, Languages, SlidersHorizontal, ArrowDownWideNarrow, ArrowUpWideNarrow, SpellCheck, Trophy, WholeWord } from "lucide-react";
import { editResumeText, type EditResumeTextInput } from "@/ai/flows/edit-resume-text";
import { useToast } from "@/hooks/use-toast";

type EditMode = EditResumeTextInput["mode"];
type Tone = NonNullable<EditResumeTextInput["tone"]>;
type Length = NonNullable<EditResumeTextInput["length"]>;

const editModes: { id: EditMode; label: string; icon: React.ReactNode, requiresJob?: boolean, hasTone?: boolean, hasLength?: boolean }[] = [
  { id: "Rewrite", label: "Rewrite", icon: <PencilLine /> },
  { id: "Strengthen", label: "Strengthen", icon: <Trophy /> },
  { id: "Shorten", label: "Shorten", icon: <ArrowDownWideNarrow /> },
  { id: "Expand", label: "Expand", icon: <ArrowUpWideNarrow /> },
  { id: "Bullet Conversion", label: "To Bullets", icon: <Wand2 /> },
  { id: "Paragraph", label: "To Paragraph", icon: <Pilcrow /> },
  { id: "Job-Align", label: "Align to Job", icon: <SlidersHorizontal />, requiresJob: true },
  { id: "Tone", label: "Change Tone", icon: <CaseSensitive />, hasTone: true },
  { id: "Grammar Fix", label: "Fix Grammar", icon: <SpellCheck /> },
  { id: "Summarize", label: "Summarize", icon: <WholeWord /> },
  { id: "Length Control", label: "Set Length", icon: <Languages />, hasLength: true },
];

const tones: Tone[] = ["Professional", "Formal", "Modern", "Confident", "Simple", "Executive", "Technical", "Friendly", "Minimalistic"];
const lengths: Length[] = ["short", "medium", "long"];

interface AiEditToolbarProps {
  originalContent: string;
  onAccept: (newContent: string) => void;
  targetJob?: string;
}

export function AiEditToolbar({ originalContent, onAccept, targetJob }: AiEditToolbarProps) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const { toast } = useToast();

  const handleAiAction = async (
    mode: EditMode,
    tone?: Tone,
    length?: Length
  ) => {
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
                    variant="outline"
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
            variant="outline"
            size="sm"
            className="w-full justify-start gap-2"
            onClick={handleClick}
            >
            {icon}
            {label}
        </Button>
    )
  };
  
  const handleAccept = () => {
    if (generatedContent) {
        onAccept(generatedContent);
        setPopoverOpen(false);
        setGeneratedContent(null);
    }
  }
  
  const handleDiscard = () => {
    setGeneratedContent(null);
  }

  return (
    <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="absolute -top-3 -right-3 h-7 w-7 rounded-full bg-primary text-primary-foreground opacity-0 group-hover/editable:opacity-100 transition-opacity"
        >
          <MagicWandIcon className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="end">
        <div className="space-y-4">
          <div>
            <Label className="text-xs font-semibold text-muted-foreground">Original Content</Label>
            <p className="text-sm border rounded-md p-2 bg-muted/50 max-h-24 overflow-y-auto">{originalContent}</p>
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
                <div className="text-sm border rounded-md p-2 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 max-h-32 overflow-y-auto">{generatedContent}</div>
                 <div className="flex justify-end gap-2 mt-2">
                    <Button variant="ghost" size="sm" className="gap-1 h-7" onClick={handleDiscard}><X className="h-3 w-3" /> Discard</Button>
                    <Button size="sm" className="gap-1 h-7" onClick={handleAccept}><Check className="h-3 w-3" /> Accept</Button>
                </div>
            </div>
          )}
          
          {!isLoading && !generatedContent && (
             <div className="grid grid-cols-2 gap-2">
                {editModes.map(mode => (
                  <ModeButton key={mode.id} {...mode} />
                ))}
             </div>
          )}
          
          {targetJob && <p className="text-xs text-muted-foreground mt-2 border-t pt-2">✨ Aligning to job: "{targetJob.substring(0, 50)}..."</p>}
        </div>
      </PopoverContent>
    </Popover>
  );
}
