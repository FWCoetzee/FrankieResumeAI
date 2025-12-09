
'use client';

import { useState, useEffect } from 'react';

export type PlanId = 'free' | 'pro' | 'lifetime';

export interface Plan {
  id: PlanId;
  name: string;
  price: string;
  pricePeriod: string;
  description: string;
  features: string[];
}

const plans: Record<PlanId, Plan> = {
  free: {
    id: 'free',
    name: 'Free Plan',
    price: 'R0',
    pricePeriod: 'always',
    description: 'Perfect for getting started and testing the waters.',
    features: ['1 AI Resume Generation', 'Basic Resume Template', 'Watermarked PDF download'],
  },
  pro: {
    id: 'pro',
    name: 'Pro Plan',
    price: 'R99',
    pricePeriod: 'per month',
    description: 'The essential toolkit for active job seekers.',
    features: [
      'Unlimited AI Resumes',
      'All Pro Templates',
      'Job-Tailored Rewrites',
      'AI Cover Letters',
      'LinkedIn Enhancements',
      'Multi-Language Export',
    ],
  },
  lifetime: {
    id: 'lifetime',
    name: 'Lifetime Deal',
    price: 'R199',
    pricePeriod: 'once-off',
    description: 'Pay once and own it forever. No subscriptions.',
    features: [
      'Everything in Pro, forever',
      'All Future Tools & Updates included',
      'One-Time Payment',
      'Priority Support',
    ],
  },
};

export interface UserDetails {
  firstName: string;
  email: string;
  acceptTerms: boolean;
  emailUpdates?: boolean;
  cvFile?: FileList;
}

export const useSubscription = (initialPlanId: PlanId = 'pro') => {
  const [planId, setPlanId] = useState<PlanId>(initialPlanId);
  const [plan, setPlan] = useState<Plan | null>(plans[initialPlanId]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    setPlan(plans[planId] || null);
  }, [planId]);

  return {
    plan,
    planId,
    setPlanId,
    userDetails,
    setUserDetails,
    currentStep,
    setCurrentStep,
  };
};
