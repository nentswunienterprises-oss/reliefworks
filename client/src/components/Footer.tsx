import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="py-24 px-6 border-t border-border/40 bg-background">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-12">
        <div className="max-w-md">
          <h2 className="font-display text-2xl md:text-3xl mb-6 text-primary">
            Relief Works is not building the future. It’s making the future feel manageable.
          </h2>
          <div className="flex flex-col gap-1">
            <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Relief Works Technologies</span>
            <span className="text-sm text-muted-foreground">All rights reserved.</span>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6">
          <nav className="flex gap-8">
            <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">Manifesto</Link>
            <Link href="/services" className="text-sm text-muted-foreground hover:text-primary transition-colors">Relief</Link>
            <Link href="/diagnosis" className="text-sm text-muted-foreground hover:text-primary transition-colors">Diagnosis</Link>
          </nav>
          
          <div className="text-xs text-muted-foreground/60">
            Design by Relief Works
          </div>
        </div>
      </div>
    </footer>
  );
}
