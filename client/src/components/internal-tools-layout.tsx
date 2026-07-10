import type { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { FileOutput, Mail, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminSession } from "@/hooks/use-admin";

type InternalToolsLayoutProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const navigation = [
  { href: "/generate-email", label: "Email Generator", icon: Mail },
  { href: "/generate-pdf", label: "PDF Generator", icon: FileOutput },
] as const;

export function InternalToolsLayout({
  title,
  description,
  children,
}: InternalToolsLayoutProps) {
  const sessionQuery = useAdminSession();
  const [location] = useLocation();

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-5xl">
          <Card className="border-border/50 bg-card/90">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-primary">
                Checking internal access
              </CardTitle>
              <CardDescription>Loading the Relief Works admin session.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (!sessionQuery.data?.isAuthenticated) {
    return (
      <div className="min-h-screen bg-background px-6 py-10 text-foreground">
        <div className="mx-auto max-w-4xl">
          <Card className="border-border/50 bg-card/90">
            <CardHeader>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10 text-primary">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <CardTitle className="font-display text-3xl text-primary">
                Internal tools require admin access
              </CardTitle>
              <CardDescription className="max-w-2xl text-base leading-relaxed">
                This document generator is protected behind the Relief Works admin session.
                Sign in first, then return here to compose, preview, and save branded outputs.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/admin">Open Admin</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Return to Site</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground md:px-12">
      <main className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-[2rem] border border-border/40 bg-card px-8 py-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-primary/70">
                Relief Works Internal Tools
              </p>
              <h1 className="font-display text-4xl text-primary md:text-5xl">{title}</h1>
              <p className="max-w-3xl text-base leading-relaxed text-muted-foreground">
                {description}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild variant="outline">
                <Link href="/admin">Back to Admin</Link>
              </Button>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Button key={item.href} asChild variant={isActive ? "default" : "outline"} className="gap-2">
                  <Link href={item.href}>
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                </Button>
              );
            })}
          </div>
        </section>

        {children}
      </main>
    </div>
  );
}
