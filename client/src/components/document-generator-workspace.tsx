import { useEffect, useState } from "react";
import { Download, FileOutput, Mail, RefreshCw } from "lucide-react";
import { api } from "@shared/routes";
import {
  applyDocumentTypeDefaults,
  buildDocumentMarkdown,
  coerceDocumentState,
  createDefaultDocumentState,
  renderEmailHtmlFromMarkdown,
  renderPdfHtmlFromMarkdown,
  type DocumentComposerState,
  type DocumentType,
} from "@/lib/document-composer";
import {
  clearAutosavedComposerState,
  deleteLocalNamedDraft,
  listLocalNamedDrafts,
  readAutosavedComposerState,
  saveLocalNamedDraft,
  writeAutosavedComposerState,
} from "@/lib/document-drafts";
import { DocumentComposerPanel } from "@/components/document-composer-panel";
import { InternalToolsLayout } from "@/components/internal-tools-layout";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useDeleteDocumentDraft, useDocumentDrafts, useSaveDocumentDraft } from "@/hooks/use-document-drafts";
import { useAdminSession } from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";

type DocumentGeneratorWorkspaceProps = {
  mode: "email" | "pdf";
};

function createHtmlDownload(content: string, fileName: string) {
  const blob = new Blob([content], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${fileName}.html`;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function copyRichHtml(html: string, plainText: string) {
  if (navigator.clipboard && "ClipboardItem" in window) {
    const item = new ClipboardItem({
      "text/html": new Blob([html], { type: "text/html" }),
      "text/plain": new Blob([plainText], { type: "text/plain" }),
    });
    await navigator.clipboard.write([item]);
    return;
  }

  await navigator.clipboard.writeText(plainText);
}

export function DocumentGeneratorWorkspace({ mode }: DocumentGeneratorWorkspaceProps) {
  const { toast } = useToast();
  const sessionQuery = useAdminSession();
  const remoteDraftsQuery = useDocumentDrafts(Boolean(sessionQuery.data?.isAuthenticated));
  const saveRemoteDraftMutation = useSaveDocumentDraft();
  const deleteRemoteDraftMutation = useDeleteDocumentDraft();
  const [composerState, setComposerState] = useState<DocumentComposerState>(() =>
    readAutosavedComposerState() ?? createDefaultDocumentState("letter"),
  );
  const [localDrafts, setLocalDrafts] = useState(listLocalNamedDrafts);
  const [useReferenceBackground, setUseReferenceBackground] = useState(false);
  const [copyingHtml, setCopyingHtml] = useState(false);
  const [downloadingPdf, setDownloadingPdf] = useState(false);

  useEffect(() => {
    writeAutosavedComposerState(composerState);
  }, [composerState]);

  const markdown = buildDocumentMarkdown(composerState);
  const emailRendered = renderEmailHtmlFromMarkdown(markdown);
  const pdfRendered = renderPdfHtmlFromMarkdown(markdown, undefined, useReferenceBackground);

  function updateState<Key extends keyof DocumentComposerState>(
    field: Key,
    value: DocumentComposerState[Key],
  ) {
    setComposerState((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function handleDocumentTypeChange(documentType: DocumentType) {
    setComposerState((current) => coerceDocumentState(applyDocumentTypeDefaults(current, documentType)));
  }

  function handleSectionChange(sectionId: string, field: "heading" | "content", value: string) {
    setComposerState((current) => ({
      ...current,
      sections: current.sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section,
      ),
    }));
  }

  function handleAddSection() {
    setComposerState((current) => ({
      ...current,
      sections: [
        ...current.sections,
        {
          id: Math.random().toString(36).slice(2, 10),
          heading: "New Section",
          content: "",
        },
      ],
    }));
  }

  function handleRemoveSection(sectionId: string) {
    setComposerState((current) => ({
      ...current,
      sections: current.sections.filter((section) => section.id !== sectionId),
    }));
  }

  function refreshLocalDrafts() {
    setLocalDrafts(listLocalNamedDrafts());
  }

  function handleSaveLocalDraft() {
    saveLocalNamedDraft({
      name: composerState.draftName,
      composerState,
      markdown,
    });
    refreshLocalDrafts();
    toast({
      title: "Local draft saved",
      description: "This draft is now stored in the browser on this device.",
    });
  }

  function handleLoadLocalDraft(draftId: string) {
    const draft = localDrafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    setComposerState(coerceDocumentState(draft.composerState));
    toast({
      title: "Local draft loaded",
      description: `Loaded "${draft.name}".`,
    });
  }

  function handleDeleteLocalDraft(draftId: string) {
    const draft = localDrafts.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    if (!window.confirm(`Delete the local draft "${draft.name}"?`)) {
      return;
    }

    deleteLocalNamedDraft(draftId);
    refreshLocalDrafts();
    toast({
      title: "Local draft deleted",
      description: "The browser-saved draft has been removed.",
    });
  }

  async function handleSaveRemoteDraft(draftId?: number) {
    try {
      await saveRemoteDraftMutation.mutateAsync({
        id: draftId,
        name: composerState.draftName,
        documentType: composerState.documentType,
        markdown,
        composerState,
      });
      toast({
        title: "Remote draft saved",
        description: "The draft is now available through the admin session.",
      });
    } catch (error) {
      toast({
        title: "Remote save failed",
        description: error instanceof Error ? error.message : "Unable to save the remote draft.",
        variant: "destructive",
      });
    }
  }

  function handleLoadRemoteDraft(draftId: number) {
    const draft = remoteDraftsQuery.data?.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    setComposerState(coerceDocumentState(draft.composerState));
    toast({
      title: "Remote draft loaded",
      description: `Loaded "${draft.name}".`,
    });
  }

  async function handleDeleteRemoteDraft(draftId: number) {
    const draft = remoteDraftsQuery.data?.find((item) => item.id === draftId);
    if (!draft) {
      return;
    }

    if (!window.confirm(`Delete the remote draft "${draft.name}"?`)) {
      return;
    }

    try {
      await deleteRemoteDraftMutation.mutateAsync(draftId);
      toast({
        title: "Remote draft deleted",
        description: "The server-backed draft has been removed.",
      });
    } catch (error) {
      toast({
        title: "Remote delete failed",
        description: error instanceof Error ? error.message : "Unable to delete the remote draft.",
        variant: "destructive",
      });
    }
  }

  async function handleCopyEmailHtml() {
    setCopyingHtml(true);
    try {
      await copyRichHtml(emailRendered.html, emailRendered.plainText);
      toast({
        title: "Email HTML copied",
        description: "You can paste it directly into a mail composer that supports rich HTML.",
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: error instanceof Error ? error.message : "Unable to copy the email HTML.",
        variant: "destructive",
      });
    } finally {
      setCopyingHtml(false);
    }
  }

  function handleDownloadEmailHtml() {
    createHtmlDownload(emailRendered.html, emailRendered.fileName);
    toast({
      title: "HTML downloaded",
      description: "The branded email HTML has been downloaded.",
    });
  }

  async function handleDownloadPdf() {
    setDownloadingPdf(true);
    try {
      const response = await fetch(api.documents.generatePdf.path, {
        method: api.documents.generatePdf.method,
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          markdown,
          fileName: composerState.documentTitle,
          useReferenceBackground,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "Unable to generate PDF");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `${pdfRendered.fileName}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast({
        title: "PDF downloaded",
        description: "The Relief Works PDF has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "PDF generation failed",
        description: error instanceof Error ? error.message : "Unable to download the PDF.",
        variant: "destructive",
      });
    } finally {
      setDownloadingPdf(false);
    }
  }

  function handleResetComposer() {
    if (!window.confirm("Reset the current composer and clear the autosaved state?")) {
      return;
    }

    const nextState = createDefaultDocumentState(composerState.documentType);
    setComposerState(nextState);
    clearAutosavedComposerState();
    toast({
      title: "Composer reset",
      description: "The current working state has been reset to the default template.",
    });
  }

  const isEmailMode = mode === "email";
  const previewHtml = isEmailMode ? emailRendered.html : pdfRendered.html;
  const title = isEmailMode ? "Email Generator" : "PDF Generator";
  const description = isEmailMode
    ? "Compose structured business documents, preview the branded email output, and copy HTML directly into your outgoing mail workflow."
    : "Compose structured business documents, preview the branded print layout, and generate A4 PDFs through the protected server runtime.";

  return (
    <InternalToolsLayout title={title} description={description}>
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DocumentComposerPanel
          state={composerState}
          markdown={markdown}
          localDrafts={localDrafts}
          remoteDrafts={remoteDraftsQuery.data ?? []}
          saveRemotePending={saveRemoteDraftMutation.isPending}
          deleteRemotePending={deleteRemoteDraftMutation.isPending}
          onChange={updateState}
          onDocumentTypeChange={handleDocumentTypeChange}
          onSectionChange={handleSectionChange}
          onAddSection={handleAddSection}
          onRemoveSection={handleRemoveSection}
          onSaveLocalDraft={handleSaveLocalDraft}
          onLoadLocalDraft={handleLoadLocalDraft}
          onDeleteLocalDraft={handleDeleteLocalDraft}
          onSaveRemoteDraft={handleSaveRemoteDraft}
          onLoadRemoteDraft={handleLoadRemoteDraft}
          onDeleteRemoteDraft={handleDeleteRemoteDraft}
        />

        <div className="space-y-6">
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle className="font-display text-2xl text-primary">
                    {isEmailMode ? "Email Output" : "PDF Output"}
                  </CardTitle>
                  <CardDescription>
                    {isEmailMode
                      ? "Preview the email-safe HTML and export it for direct sending."
                      : "Preview the print layout and generate the binary PDF from the server."}
                  </CardDescription>
                </div>
                <Badge variant="outline">{composerState.documentType}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {!isEmailMode ? (
                <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/50 px-4 py-3">
                  <div>
                    <Label htmlFor="referenceBackground" className="text-sm font-medium">
                      Reference background
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Keep the subtle branded background active in the generated PDF.
                    </p>
                  </div>
                  <Switch
                    id="referenceBackground"
                    checked={useReferenceBackground}
                    onCheckedChange={setUseReferenceBackground}
                  />
                </div>
              ) : null}

              <div className="flex flex-wrap gap-3">
                {isEmailMode ? (
                  <>
                    <Button onClick={() => void handleCopyEmailHtml()} disabled={copyingHtml} className="gap-2">
                      <Mail className="h-4 w-4" />
                      {copyingHtml ? "Copying..." : "Copy Rich HTML"}
                    </Button>
                    <Button variant="outline" onClick={handleDownloadEmailHtml} className="gap-2">
                      <Download className="h-4 w-4" />
                      Download HTML
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => void handleDownloadPdf()} disabled={downloadingPdf} className="gap-2">
                    <FileOutput className="h-4 w-4" />
                    {downloadingPdf ? "Generating..." : "Download PDF"}
                  </Button>
                )}

                <Button variant="ghost" onClick={handleResetComposer} className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Reset Composer
                </Button>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Title</p>
                  <p className="mt-2 text-sm text-foreground">{composerState.documentTitle}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Client</p>
                  <p className="mt-2 text-sm text-foreground">{composerState.clientName || "Not set"}</p>
                </div>
                <div className="rounded-2xl border border-border/50 bg-background/40 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-primary/70">Reference</p>
                  <p className="mt-2 text-sm text-foreground">{composerState.referenceNumber || "Not set"}</p>
                </div>
              </div>

              <div className="overflow-hidden rounded-[1.5rem] border border-border/50 bg-background">
                <iframe
                  title={isEmailMode ? "Relief Works email preview" : "Relief Works PDF preview"}
                  srcDoc={previewHtml}
                  className="h-[920px] w-full bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </InternalToolsLayout>
  );
}
