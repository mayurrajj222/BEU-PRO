
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const dynamic = 'force-dynamic'; // Ensures the page is dynamically rendered

const QUOTES = [
  "Patience is bitter, but its fruit is sweet. - Aristotle",
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. - Winston Churchill",
  "Hold the vision, trust the process.",
  "Good things come to those who wait.",
  "Loading your future... please wait.",
  "Fetching results... this might take a moment if servers are busy.",
  "Keep calm and wait for your results.",
  "Just a little longer..."
];

function ResultViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true); // True during any load/reload attempt
  const [iframeLoadCount, setIframeLoadCount] = useState(0); // To trigger iframe reload via key
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  const originalUrl = useMemo(() => {
    const url = searchParams.get('url');
    return url ? decodeURIComponent(url) : null;
  }, [searchParams]);

  useEffect(() => {
    if (originalUrl) {
      setIsLoading(true); 
    } else {
      const timer = setTimeout(() => router.push('/'), 100); // A bit more delay
      return () => clearTimeout(timer);
    }
  }, [originalUrl, router]);

  // Auto-retry logic
  useEffect(() => {
    if (!originalUrl) return; 

    const retryIntervalMs = 30000; // 30 seconds
    const intervalId = setInterval(() => {
      setIsLoading(true); 
      setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
      setIframeLoadCount(prevCount => prevCount + 1); // This triggers iframe reload via key
    }, retryIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [originalUrl]);


  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  const handleIframeError = () => {
    // This error typically fires for network issues with the iframe src itself,
    // or if the src domain doesn't exist / CORS blocks iframe at a very low level.
    // It does NOT typically fire for HTTP 404/500 errors *within* the iframe.
    setIsLoading(false); 
  }

  if (!originalUrl && !isLoading) {
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">No result URL found. Redirecting...</p>
      </div>
    );
  }
  
  if (!originalUrl && isLoading) { // Initial loading state before originalUrl is available from search params
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing result viewer...</p>
      </div>
    );
  }


  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="truncate px-2 text-lg font-semibold text-card-foreground">
          Official Result Viewer
        </h1>
        <div className="w-10 h-10"> {/* Placeholder for spacing */} </div>
      </header>

      <main className="relative flex-1 overflow-hidden bg-muted/20">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-6 text-lg font-medium text-foreground">
              {QUOTES[currentQuoteIndex]}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attempting to load results. This may take a moment if the server is busy. Retrying periodically.
            </p>
          </div>
        )}
        {originalUrl && (
          <iframe
            key={`result-iframe-${iframeLoadCount}`} 
            src={originalUrl}
            title="BEUP Official Result"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={handleIframeLoad}
            onError={handleIframeError} 
          />
        )}
         {!originalUrl && !isLoading && ( // Fallback if originalUrl is null but not loading (e.g. originalUrl was bad)
            <div className="flex h-full items-center justify-center p-4 text-center">
                <p className="text-destructive-foreground">Could not initiate result loading. Please go back and try again.</p>
            </div>
        )}
      </main>
      <footer className="flex-shrink-0 border-t bg-card p-3 text-center text-xs text-muted-foreground">
        If the content above is blank or shows an error, the official website may be experiencing high traffic, does not permit embedding, or the page might not be available. Retries are attempted automatically every 30 seconds.
      </footer>
    </div>
  );

}


export default function ResultViewerPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="mt-4 text-muted-foreground">Loading result viewer...</p>
    </div>}>
      <ResultViewerContent />
    </Suspense>
  );
}

