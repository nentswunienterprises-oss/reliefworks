import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

import logoUrl from "@assets/image_1769288942915.png";

export function Navigation() {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Manifesto" },
    { href: "/services", label: "Relief" },
    { href: "/diagnosis", label: "Diagnosis" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="group flex items-center gap-4">
          <img src={logoUrl} alt="Relief Works Logo" className="h-10 w-auto invert brightness-0" />
          <div className="flex flex-col">
            <span className="font-display text-xl font-bold tracking-tight text-primary">Relief Works</span>
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground group-hover:text-primary transition-colors">
              Technologies
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-12">
          {links.map((link) => (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "relative text-sm font-medium tracking-wide transition-colors duration-200 hover:text-primary",
                location === link.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {link.label}
              {location === link.href && (
                <motion.div
                  layoutId="underline"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-primary"
                />
              )}
            </Link>
          ))}
        </nav>

        {/* Mobile menu placeholder - hidden on desktop */}
        <div className="md:hidden">
          <Link href="/diagnosis" className="text-sm font-medium text-primary">
            Start
          </Link>
        </div>
      </div>
    </header>
  );
}
