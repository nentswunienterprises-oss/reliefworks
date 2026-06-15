import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRoute } from "wouter";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";

function publicQuotePath(token: string) {
  return api.public.quoteByToken.path.replace(":approvalToken", token);
}

function approveQuotePath(token: string) {
  return api.public.approveQuote.path.replace(":approvalToken", token);
}

export default function QuoteApproval() {
  const [match, params] = useRoute<{ token: string }>("/quote/:token");
  const queryClient = useQueryClient();
  const token = params?.token || "";

  const quoteQuery = useQuery({
    queryKey: ["public-quote", token],
    enabled: Boolean(match && token),
    queryFn: async () => {
      const res = await fetch(publicQuotePath(token));
      if (!res.ok) {
        throw new Error("Quote could not be loaded.");
      }
      return api.public.quoteByToken.responses[200].parse(await res.json());
    },
  });

  const approveMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(api.public.approveQuote.method, approveQuotePath(token));
      return api.public.approveQuote.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["public-quote", token] });
    },
  });

  const canApprove = useMemo(() => {
    const quote = quoteQuery.data;
    if (!quote) {
      return false;
    }
    if (quote.status === "approved") {
      return false;
    }
    if (!quote.expiresAt) {
      return true;
    }
    return new Date(quote.expiresAt).getTime() >= Date.now();
  }, [quoteQuery.data]);

  if (!match) {
    return (
      <div className="min-h-screen bg-background text-foreground px-6 py-10 md:px-12">
        <div className="mx-auto max-w-3xl">
          <p className="text-sm text-muted-foreground">Quote route not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-10 md:px-12">
      <main className="mx-auto max-w-3xl space-y-6">
        <Badge variant="outline" className="border-primary/30 text-primary">Relief Works Quote Approval</Badge>

        <Card className="border-border/50 bg-card/90">
          <CardHeader>
            <CardTitle className="font-display text-4xl text-primary">Review Your Quote</CardTitle>
            <CardDescription>
              Approve this quote to start project execution and trigger invoice creation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {quoteQuery.isLoading && <p className="text-sm text-muted-foreground">Loading quote...</p>}
            {quoteQuery.isError && <p className="text-sm text-destructive">Quote not found or no longer available.</p>}

            {quoteQuery.data && (
              <>
                <div className="rounded-xl border border-border/60 bg-background/70 p-4 space-y-2">
                  <p className="text-sm text-muted-foreground">Quote Number</p>
                  <p className="font-medium text-foreground">{quoteQuery.data.quoteNumber}</p>
                  <p className="text-sm text-muted-foreground">Client</p>
                  <p className="font-medium text-foreground">{quoteQuery.data.clientName}</p>
                  <p className="text-sm text-muted-foreground">Title</p>
                  <p className="font-medium text-foreground">{quoteQuery.data.title}</p>
                  {quoteQuery.data.scope && (
                    <>
                      <p className="text-sm text-muted-foreground">Scope</p>
                      <p className="text-foreground leading-relaxed">{quoteQuery.data.scope}</p>
                    </>
                  )}
                </div>

                <div className="rounded-xl border border-border/60 bg-background/70 p-4">
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-semibold text-primary">
                    {quoteQuery.data.currency} {quoteQuery.data.totalAmount}
                  </p>
                </div>

                <Button
                  className="w-full"
                  disabled={!canApprove || approveMutation.isPending}
                  onClick={() => approveMutation.mutate()}
                >
                  {approveMutation.isPending ? "Approving..." : quoteQuery.data.status === "approved" ? "Already approved" : "Approve Quote"}
                </Button>

                {approveMutation.isError && (
                  <p className="text-sm text-destructive">Approval failed. This quote might be expired.</p>
                )}
                {quoteQuery.data.status === "approved" && (
                  <p className="text-sm text-primary">Quote approved successfully. Relief Works will continue with next steps.</p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
