
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export default function ResultViewerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [iframeSrc, setIframeSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const url = searchParams.get('url');
    if (url) {
      setIframeSrc(decodeURIComponent(url));
    } else {
      setTimeout(() => router.push('/'), 50); 
    }
    const timer = setTimeout(() => setIsLoading(false), 500); 
    return () => clearTimeout(timer);

  }, [searchParams, router]);

  if (isLoading && !iframeSrc) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Loading result viewer...</p>
      </div>
    );
  }
  
  if (!iframeSrc && !isLoading) { 
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="text-destructive">Could not load result viewer. Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="truncate px-2 text-lg font-semibold text-card-foreground">
          Official Result
        </h1>
        <div className="w-10 h-10"> {/* Placeholder for spacing, as button was removed */} </div>
      </header>
      <main className="flex-1 overflow-hidden">
        {iframeSrc ? (
          <iframe
            src={iframeSrc}
            title="BEUP Official Result"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setIsLoading(false)} 
            onError={() => setIsLoading(false)} 
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Preparing viewer...</p>
          </div>
        )}
      </main>
      <footer className="flex-shrink-0 border-t bg-card p-3 text-center text-xs text-muted-foreground">
        If the content above is blank or shows an error, the official website may not permit embedding or the page might not be available.
      </footer>
    </div>
  );
}
