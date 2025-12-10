import { DashboardPage } from "@/components/dashboard-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard - DeepResumeAI',
  description: 'Manage your resumes and create new ones.',
};

export default function Dashboard() {
  return (
    <DashboardPage />
  );
}
