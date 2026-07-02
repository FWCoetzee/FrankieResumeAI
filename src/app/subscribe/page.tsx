
import { SubscribeFlow } from "@/components/subscribe-flow";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Complete Your Order - DeepResumeAI',
  description: 'Confirm your plan and details to unlock your AI resume tools.',
};

// The 'searchParams' prop is used to access URL query parameters in a Server Component.
export default async function SubscribePage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  // We extract the 'plan' from the searchParams and pass it to the client component.
  // This is a robust way to handle dynamic routing information.
  const plan = typeof resolvedSearchParams.plan === 'string' ? resolvedSearchParams.plan : 'pro';

  return (
    <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl">
      <SubscribeFlow selectedPlanId={plan} />
    </div>
  );
}
