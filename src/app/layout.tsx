import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import { AppLogo } from '@/components/icons';
import { UserNav } from '@/components/user-nav';

export const metadata: Metadata = {
  title: 'DeepResumeAI',
  description: 'Generate a professional resume with the power of AI',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <FirebaseClientProvider>
          <div className="relative min-h-screen bg-background">
            <header className="container mx-auto px-4 py-8 flex justify-between items-center mb-8">
              <div className="flex items-center justify-center gap-3">
                <AppLogo className="h-8 w-8 text-primary" />
                <h1 className="text-4xl font-bold tracking-tight text-primary">
                  DeepResumeAI
                </h1>
              </div>
              <div className="flex items-center gap-4">
                 <UserNav />
              </div>
            </header>
            <main className="container mx-auto px-4 pb-8">
              {children}
            </main>
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
