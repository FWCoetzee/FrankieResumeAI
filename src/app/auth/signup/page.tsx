
import { SignUpPage } from "@/components/signup-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign Up - DeepResumeAI',
  description: 'Create an account to start building your AI-powered resume.',
};

export default function SignUp() {
  return (
    <SignUpPage />
  );
}
