import { cn } from '@/lib/utils';

export function AdBanner({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-border bg-muted/40 p-3 text-center text-sm text-muted-foreground',
        className,
      )}
    >
      Upgrade to unlock extra AI exports and publishing tools.
    </div>
  );
}
