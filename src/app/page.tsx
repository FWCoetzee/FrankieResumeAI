
import { AppLogo } from "@/components/icons";
import { ResumeBuilder } from "@/components/resume-builder";
import { UserNav } from "@/components/user-nav";

export default function Home() {
  return (
    <main className="relative min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center justify-center gap-3">
            <AppLogo className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold tracking-tight text-primary">
              DeepResumeAI
            </h1>
          </div>
          <div className="flex items-center gap-4">
             <UserNav />
          </div>
        </header>
        <ResumeBuilder />
      </div>
    </main>
  );
}
