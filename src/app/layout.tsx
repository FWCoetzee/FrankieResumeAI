
import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppLogo } from '@/components/icons';
import { UserNav } from '@/components/user-nav';
import { Providers } from '@/components/providers';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'DeepResume',
  description: 'Generate a professional resume with the power of AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-sans antialiased">
        <Providers>
          <div className="relative min-h-screen bg-background">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto flex h-16 items-center justify-between">
                <Link href="/" className="flex items-center gap-3">
                  <AppLogo className="h-8 w-8 text-primary" />
                  <h1 className="text-2xl font-bold tracking-tight text-primary hidden sm:block">
                    DeepResume
                  </h1>
                </Link>
                
                <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
                  <Link href="/#features" className="text-muted-foreground transition-colors hover:text-foreground">Features</Link>
                  <Link href="/pricing" className="text-muted-foreground transition-colors hover:text-foreground">Pricing</Link>
                  <Link href="/#faq" className="text-muted-foreground transition-colors hover:text-foreground">FAQ</Link>
                </nav>

                <UserNav />
              </div>
            </header>
            <main>
              {children}
            </main>
            {/* This div is required for Firebase App Check with reCAPTCHA v2 */}
            <div id="recaptcha-container" className="fixed bottom-4 right-4 z-50"></div>
          </div>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
