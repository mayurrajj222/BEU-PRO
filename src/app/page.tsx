import { BeupResultClientPage } from '@/components/beup-result-client-page';

const BeuLogo = () => (
  <svg width="52" height="52" viewBox="0 0 52 52" xmlns="http://www.w3.org/2000/svg" fill="none">
    <rect x="2" y="2" width="48" height="48" rx="10" ry="10" fill="#0A192F" stroke="#61DAFB" strokeWidth="2.5"/>
    <text x="50%" y="52%" dominantBaseline="middle" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontSize="20" fontWeight="bold" fill="#61DAFB">
      BEU
    </text>
  </svg>
);

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary/20">
      <div className="w-full max-w-2xl space-y-8 py-8">
        <header className="text-center space-y-3">
          <div className="inline-flex items-center justify-center p-1 bg-transparent text-primary-foreground rounded-full mb-3">
            <BeuLogo />
          </div>
          <h1 className="text-3xl md:text-4xl font-headline font-bold text-primary tracking-tight">
            BEU Pro Result
          </h1>
          <p className="text-muted-foreground md:text-lg">
            Instantly access your BTEUP (AKTU) semester results.
          </p>
        </header>
        
        <BeupResultClientPage />

      </div>
      <footer className="w-full max-w-2xl text-center py-8 mt-auto">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} BEU Pro Result. All data is sourced directly from the official university website.
        </p>
        <p className="text-xs text-muted-foreground/80 mt-1">
          This is an unofficial tool designed for convenience. Always verify results with official sources.
        </p>
      </footer>
    </div>
  );
}
