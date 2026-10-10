import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export function SubscribeFlow({ selectedPlanId }: { selectedPlanId?: string }) {
  return (
    <Card className="mx-auto max-w-2xl">
      <CardHeader>
        <CardTitle>Complete your order</CardTitle>
        <CardDescription>Selected plan: {selectedPlanId ?? 'pro'}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          This is the public checkout placeholder. Connect your real payment flow here when ready.
        </p>
        <Button className="w-full">Continue to checkout</Button>
      </CardContent>
    </Card>
  );
}
