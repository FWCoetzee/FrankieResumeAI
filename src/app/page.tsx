
import { LandingPage } from "@/components/landing-page";
import { OnboardingFlow } from "@/components/onboarding-flow";

export default function Home() {
  return (
    <>
      <LandingPage />
      <div id="resume-builder" className="container mx-auto px-4 py-16 md:py-24">
        <OnboardingFlow />
      </div>
    </>
  );
}
