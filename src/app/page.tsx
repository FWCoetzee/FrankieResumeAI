
import { LandingPage } from "@/components/landing-page";
import { ResumeBuilder } from "@/components/resume-builder";

export default function Home() {
  return (
    <>
      <LandingPage />
      <div className="container mx-auto px-4 pb-8">
        <ResumeBuilder />
      </div>
    </>
  );
}
