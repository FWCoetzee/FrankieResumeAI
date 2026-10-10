import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const plans = [
  { name: 'Free', price: '$0', description: 'Try the essentials and generate a draft.' },
  { name: 'Pro', price: '$19/mo', description: 'Unlimited AI résumé generation and exports.' },
  { name: 'Team', price: '$49/mo', description: 'Shared workflows for collaborative job search.' },
];

export function PricingPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 py-12">
      <div className="text-center space-y-3">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">Pricing</p>
        <h1 className="text-4xl font-bold">Choose the plan that fits your next move</h1>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card key={plan.name} className="h-full">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-3xl font-bold">{plan.price}</div>
              <Button className="w-full">Select {plan.name}</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
