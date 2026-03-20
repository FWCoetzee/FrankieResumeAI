'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Zap } from 'lucide-react';

interface AdBannerProps {
  className?: string;
}

export function AdBanner({ className }: AdBannerProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex-row items-center gap-4 space-y-0">
        <div className="flex-grow">
          <CardTitle className="text-base">Upgrade to Lifetime</CardTitle>
          <CardDescription className="text-sm">Remove watermarks and get an ad-free experience forever.</CardDescription>
        </div>
        <Button asChild size="sm">
          <Link href="/pricing">
            <Zap className="mr-2 h-4 w-4" /> Upgrade
          </Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
