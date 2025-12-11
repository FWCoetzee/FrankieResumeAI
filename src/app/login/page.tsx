
import { LoginPage } from "@/components/login-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log In - DeepResumeAI',
  description: 'Log in to your account to access your resumes.',
};

export default function Login() {
  return (
    <LoginPage />
  );
}
