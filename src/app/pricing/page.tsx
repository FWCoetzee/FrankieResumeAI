
import { PricingPage } from "@/components/pricing-page";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pricing - DeepResume',
  description: 'Choose the perfect plan to accelerate your job search with our AI Resume Builder.',
};

export default function Pricing() {
  return (
    <PricingPage />
  );
}
