
'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Loader2, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from "@/lib/utils";

export const dynamic = 'force-dynamic';


function ResultViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [iframeLoadCount, setIframeLoadCount] = useState(0);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

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

    setLoadError(null); 

    if (basePathParam && semesterParam && regNoParam) {
      setBasePath(decodeURIComponent(basePathParam));
      setSemester(decodeURIComponent(semesterParam));
      setCurrentRegNo(decodeURIComponent(regNoParam));
      setIsLoading(true);
      setAutoRefreshEnabled(true); 
      setIframeLoadCount(prev => prev + 1); 
    } else {
      setLoadError("Missing required parameters to display results. Please try again from the home page.");
      setIsLoading(false);
      const timer = setTimeout(() => router.push('/'), 3000); 
      return () => clearTimeout(timer);
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!effectiveUrl || !autoRefreshEnabled || !isLoading) {
      return; 
    }

    const retryIntervalMs = 30000; 
    const intervalId = setInterval(() => {
        setIframeLoadCount(prevCount => prevCount + 1); 
    }, retryIntervalMs);

    return () => {
      clearInterval(intervalId);
    };
  }, [effectiveUrl, isLoading, autoRefreshEnabled]);


  const handleIframeLoad = () => {
    setIsLoading(false);
    setAutoRefreshEnabled(false); 
    setLoadError(null);
  };
  
  const handleIframeError = (e: React.SyntheticEvent<HTMLIFrameElement, Event>) => {
    setIsLoading(false);
    setAutoRefreshEnabled(true); 
    setLoadError("The result page could not be loaded into the frame. This might be a temporary network issue or the page is unavailable. Retrying...");
    console.error("Iframe loading error:", e);
  };

  const handleScrollRegNo = (direction: 'prev' | 'next') => {
    if (!currentRegNo) return;
    setLoadError(null);

    const numericPartMatch = currentRegNo.match(/(\d+)$/);
    if (!numericPartMatch || numericPartMatch[0].length === 0) {
        setLoadError("Cannot change registration number: format not recognized.");
        return;
    }

    const fullNumberStr = numericPartMatch[0];
    const prefix = currentRegNo.substring(0, currentRegNo.length - fullNumberStr.length);
    
    let num = parseInt(fullNumberStr, 10);

    if (direction === 'next') {
      num++;
    } else {
      num--;
      if (num < 0 && fullNumberStr.length > 0) { 
         num = 0; 
      }
    }
    
    const newRegNo = prefix + num.toString().padStart(fullNumberStr.length, '0');
    
    setCurrentRegNo(newRegNo);
    setIsLoading(true);
    setAutoRefreshEnabled(true); 
    setIframeLoadCount(prev => prev + 1);
  };


  if (!effectiveUrl && isLoading && !loadError) { 
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

         <Button
            variant="outline"
            size="sm"
            onClick={() => effectiveUrl && window.open(effectiveUrl, '_blank')}
            disabled={!effectiveUrl || isLoading}
            aria-label="Open in new tab"
            className="hidden sm:inline-flex"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            New Tab
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => effectiveUrl && window.open(effectiveUrl, '_blank')}
            disabled={!effectiveUrl || isLoading}
            aria-label="Open in new tab"
            className="sm:hidden"
          >
            <ExternalLink className="h-5 w-5" />
          </Button>
      </header>

      <div className="bg-muted/30 p-3 text-center text-xs text-muted-foreground border-b">
        <p>
          You are viewing the official result page from Bihar Engineering University (BEU) embedded below.
          This tool helps you access it directly. Please verify all information with the official source.
        </p>
      </div>

      <main className="relative flex-1 overflow-hidden bg-muted/20">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 backdrop-blur-sm p-4 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="mt-6 text-lg font-medium text-foreground">
              Loading Result...
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Attempting to load results for {currentRegNo}. This may take a moment if the server is busy. Retrying periodically if needed.
            </p>
          </div>
        )}
        
        {loadError && !isLoading && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-background/95 p-4 text-center">
            <Alert variant="destructive" className="max-w-md">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>Loading Error</AlertTitle>
              <AlertDescription>{loadError}</AlertDescription>
            </Alert>
             <Button onClick={() => router.push('/')} className="mt-4">Go to Home</Button>
          </div>
        )}

        {effectiveUrl && (
          <iframe
            key={`result-iframe-${iframeLoadCount}`} 
            src={effectiveUrl}
            title="BEUP Official Result"
            className={cn(
              "h-full w-full border-0",
              (isLoading || (loadError && !isLoading)) && "opacity-0" 
            )}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups" 
            onLoad={handleIframeLoad}
            onError={handleIframeError} 
          />
        )}
      </main>
      <footer className="flex-shrink-0 border-t bg-card p-3 text-center text-xs text-muted-foreground">
        Viewing official results for {currentRegNo || "N/A"}, Semester {semester || "N/A"}. 
        If content is blank or shows an error, the official website may be busy or the page unavailable. Retries are attempted if loading fails.
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

