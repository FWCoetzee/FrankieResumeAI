
import { AccountPage } from "@/components/account-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Account Settings - DeepResumeAI',
  description: 'Manage your account details and preferences.',
};

export default function Account() {
  return (
    <AccountPage />
  );
}
