import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function LinkedInPreview({
  content,
  profile,
}: {
  content?: {
    profile?: { name?: string; headline?: string };
    summary?: string;
    headline?: string;
    experience?: Array<{ title?: string; company?: string }>;
  } | null;
  profile?: { name?: string; headline?: string };
}) {
  const displayProfile = profile ?? content?.profile ?? { name: 'Your profile', headline: 'Career profile preview' };

  return (
    <Card className="overflow-hidden border">
      <CardHeader>
        <CardTitle>{displayProfile.name ?? 'Your profile'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="font-semibold text-foreground">{displayProfile.headline ?? content?.headline ?? 'Career profile preview'}</div>
        <p>{content?.summary ?? 'Professional headline, experience summary, and skills will appear here.'}</p>
      </CardContent>
    </Card>
  );
}
