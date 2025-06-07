import { BeupResultClientPage } from '@/components/beup-result-client-page';
import { GraduationCap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-2xl space-y-8 py-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-3 bg-primary text-primary-foreground rounded-full mb-3 shadow-lg
            transform transition-transform hover:scale-110">
            <GraduationCap size={48} strokeWidth={1.5} />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">
            BEUP Result Viewer
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Instantly access your BTEUP (AKTU) semester results.
          </p>
        </header>
        
        <BeupResultClientPage />

      </div>
      <footer className="w-full max-w-2xl text-center py-8 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BEUP Result Viewer. All data is sourced directly from the official university website.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          This is an unofficial tool designed for convenience. Always verify results with official sources.
        </p>
      </footer>
    </div>
  );
}
