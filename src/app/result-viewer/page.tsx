
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoadCount, setIframeLoadCount] = useState(0);
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  const [basePath, setBasePath] = useState<string | null>(null);
  const [semester, setSemester] = useState<string | null>(null);
  const [currentRegNo, setCurrentRegNo] = useState<string | null>(null);
  
  const effectiveUrl = useMemo(() => {
    if (basePath && semester && currentRegNo) {
      return `${basePath}?Sem=${semester}&RegNo=${currentRegNo}`;
    }
    return null;
  }, [basePath, semester, currentRegNo]);

  useEffect(() => {
    const basePathParam = searchParams.get('basePath');
    const semesterParam = searchParams.get('semester');
    const regNoParam = searchParams.get('regNo');

    if (basePathParam && semesterParam && regNoParam) {
      setBasePath(decodeURIComponent(basePathParam));
      setSemester(decodeURIComponent(semesterParam));
      setCurrentRegNo(decodeURIComponent(regNoParam));
      setIsLoading(true);
      setAutoRefreshEnabled(true); // Enable auto-refresh for the initial load
      setIframeLoadCount(prev => prev + 1); // Ensure initial load attempt
    } else {
      const timer = setTimeout(() => router.push('/'), 1000); 
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  // Auto-retry logic
  useEffect(() => {
    if (!effectiveUrl || !autoRefreshEnabled || !isLoading) {
      return; // Only set interval if loading, enabled, and URL is present
    }

    const retryIntervalMs = 30000;
    const intervalId = setInterval(() => {
        setCurrentQuoteIndex((prevIndex) => (prevIndex + 1) % QUOTES.length);
        setIframeLoadCount(prevCount => prevCount + 1); 
    }, retryIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [effectiveUrl, isLoading, autoRefreshEnabled]);


  const handleIframeLoad = () => {
    setIsLoading(false);
    setAutoRefreshEnabled(false); 
  };
  
  const handleIframeError = () => {
    setIsLoading(false);
    // autoRefreshEnabled remains true by default to allow retry for network/iframe errors
  };

  const handleScrollRegNo = (direction: 'prev' | 'next') => {
    if (!currentRegNo) return;

    const numericPartMatch = currentRegNo.match(/(\d+)$/);
    if (!numericPartMatch || numericPartMatch[0].length === 0) {
        return;
    }

    const fullNumberStr = numericPartMatch[0];
    const prefix = currentRegNo.substring(0, currentRegNo.length - fullNumberStr.length);
    
    let num = parseInt(fullNumberStr, 10);

    if (direction === 'next') {
      num++;
    } else {
      num--;
      if (num < 0 && fullNumberStr.length > 0) { // Prevent negative if it's like "00" -> "-1"
         num = 0; // Or handle wrap around based on max possible if known
      }
    }
    
    const newRegNo = prefix + num.toString().padStart(fullNumberStr.length, '0');
    
    setCurrentRegNo(newRegNo);
    setIsLoading(true);
    setAutoRefreshEnabled(true); 
    setIframeLoadCount(prev => prev + 1);
  };


  if (!effectiveUrl && isLoading) { 
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Preparing result viewer...</p>
      </div>
    );
  }
   if (!effectiveUrl && !isLoading) { // Should be caught by redirect in useEffect if params missing
     return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <p className="mt-4 text-destructive">Could not load parameters. Redirecting...</p>
      </div>
    );
  }


  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-20 flex h-16 flex-shrink-0 items-center justify-between border-b bg-card px-4 shadow-sm sm:px-6">
        <Button variant="outline" size="icon" onClick={() => router.back()} aria-label="Go back">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => handleScrollRegNo('prev')} aria-label="Previous Registration Number" disabled={!currentRegNo || isLoading}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <span className="text-sm font-medium text-card-foreground tabular-nums w-28 text-center truncate" title={currentRegNo ?? undefined}>
            {currentRegNo || 'N/A'}
          </span>
          <Button variant="outline" size="icon" onClick={() => handleScrollRegNo('next')} aria-label="Next Registration Number" disabled={!currentRegNo || isLoading}>
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        <div className="w-10 h-10"> {/* Placeholder for spacing, matches back button */} </div>
      </header>

      <main className="relative flex-1 overflow-hidden bg-muted/20">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/90 backdrop-blur-sm p-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-6 text-lg font-medium text-foreground">
              {QUOTES[currentQuoteIndex]}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attempting to load results. This may take a moment if the server is busy. Retrying periodically if needed.
            </p>
          </div>
        )}
        {effectiveUrl && (
          <iframe
            key={`result-iframe-${iframeLoadCount}`} 
            src={effectiveUrl}
            title="BEUP Official Result"
            className="h-full w-full border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups" // Standard sandbox for external content
            onLoad={handleIframeLoad}
            onError={handleIframeError} 
          />
        )}
      </main>
      <footer className="flex-shrink-0 border-t bg-card p-3 text-center text-xs text-muted-foreground">
        If the content above is blank or shows an error, the official website may be experiencing high traffic or the page might not be available. Retries are attempted if loading fails.
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
