
import { AppLogo } from "@/components/icons";
import { ResumeBuilder } from "@/components/resume-builder";
import { ResumeForm } from "@/components/resume-form";
import { ResumePreview } from "@/components/resume-preview";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-2">
            <AppLogo className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              DeepResume
            </h1>
          </div>
          <p className="text-muted-foreground">
            Craft your perfect resume with the help of AI
          </p>
        </header>
        <ResumeBuilder />
      </div>
    </main>
  );
}
