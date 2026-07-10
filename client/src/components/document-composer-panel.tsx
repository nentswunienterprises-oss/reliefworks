import { Plus, Save, Trash2 } from "lucide-react";
import type { DocumentComposerDraft } from "@shared/routes";
import type { DocumentComposerState, DocumentType } from "@/lib/document-composer";
import { documentTypeOptions } from "@/lib/document-composer";
import type { LocalNamedDraft } from "@/lib/document-drafts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";

type DocumentComposerPanelProps = {
  state: DocumentComposerState;
  markdown: string;
  localDrafts: LocalNamedDraft[];
  remoteDrafts: DocumentComposerDraft[];
  saveLocalPending?: boolean;
  saveRemotePending?: boolean;
  deleteRemotePending?: boolean;
  onChange: <Key extends keyof DocumentComposerState>(
    field: Key,
    value: DocumentComposerState[Key],
  ) => void;
  onDocumentTypeChange: (documentType: DocumentType) => void;
  onSectionChange: (
    sectionId: string,
    field: "heading" | "content",
    value: string,
  ) => void;
  onAddSection: () => void;
  onRemoveSection: (sectionId: string) => void;
  onSaveLocalDraft: () => void;
  onLoadLocalDraft: (draftId: string) => void;
  onDeleteLocalDraft: (draftId: string) => void;
  onSaveRemoteDraft: (draftId?: number) => void;
  onLoadRemoteDraft: (draftId: number) => void;
  onDeleteRemoteDraft: (draftId: number) => void;
};

function labeliseDocumentType(value: DocumentType) {
  return value[0].toUpperCase() + value.slice(1);
}

function formatTimestamp(value: string | Date) {
  return new Date(value).toLocaleString();
}

export function DocumentComposerPanel({
  state,
  markdown,
  localDrafts,
  remoteDrafts,
  saveLocalPending,
  saveRemotePending,
  deleteRemotePending,
  onChange,
  onDocumentTypeChange,
  onSectionChange,
  onAddSection,
  onRemoveSection,
  onSaveLocalDraft,
  onLoadLocalDraft,
  onDeleteLocalDraft,
  onSaveRemoteDraft,
  onLoadRemoteDraft,
  onDeleteRemoteDraft,
}: DocumentComposerPanelProps) {
  return (
    <div className="space-y-6">
      <Card className="border-border/50 bg-card/85">
        <CardHeader>
          <CardTitle className="font-display text-2xl text-primary">
            Structured Authoring
          </CardTitle>
          <CardDescription>
            Compose once. Generate both Relief Works email and PDF outputs from the same source.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type</Label>
              <Select value={state.documentType} onValueChange={(value) => onDocumentTypeChange(value as DocumentType)}>
                <SelectTrigger id="documentType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {documentTypeOptions.map((option) => (
                    <SelectItem key={option} value={option}>
                      {labeliseDocumentType(option)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="draftName">Draft Name</Label>
              <Input
                id="draftName"
                value={state.draftName}
                onChange={(event) => onChange("draftName", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="documentTitle">Document Title</Label>
              <Input
                id="documentTitle"
                value={state.documentTitle}
                onChange={(event) => onChange("documentTitle", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientName">Client Name</Label>
              <Input
                id="clientName"
                value={state.clientName}
                onChange={(event) => onChange("clientName", event.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={state.date}
                onChange={(event) => onChange("date", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="referenceNumber">Reference Number</Label>
              <Input
                id="referenceNumber"
                value={state.referenceNumber}
                onChange={(event) => onChange("referenceNumber", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientName">Recipient Name</Label>
              <Input
                id="recipientName"
                value={state.recipientName}
                onChange={(event) => onChange("recipientName", event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={state.recipientEmail}
                onChange={(event) => onChange("recipientEmail", event.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subjectLine">Subject Line</Label>
            <Input
              id="subjectLine"
              value={state.subjectLine}
              onChange={(event) => onChange("subjectLine", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="intro">Intro</Label>
            <Textarea
              id="intro"
              className="min-h-[120px]"
              value={state.intro}
              onChange={(event) => onChange("intro", event.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary / Callout</Label>
            <Textarea
              id="summary"
              className="min-h-[100px]"
              value={state.summary}
              onChange={(event) => onChange("summary", event.target.value)}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Label>Sections</Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Structure the body into clear Relief Works sections.
                </p>
              </div>
              <Button type="button" variant="outline" className="gap-2" onClick={onAddSection}>
                <Plus className="h-4 w-4" />
                Add Section
              </Button>
            </div>

            <div className="space-y-4">
              {state.sections.map((section, index) => (
                <div key={section.id} className="space-y-3 rounded-2xl border border-border/50 bg-background/40 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Badge variant="outline">Section {index + 1}</Badge>
                    {state.sections.length > 1 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="gap-2 text-muted-foreground hover:text-destructive"
                        onClick={() => onRemoveSection(section.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                  <Input
                    placeholder="Section heading"
                    value={section.heading}
                    onChange={(event) =>
                      onSectionChange(section.id, "heading", event.target.value)
                    }
                  />
                  <Textarea
                    className="min-h-[130px]"
                    placeholder="Section content"
                    value={section.content}
                    onChange={(event) =>
                      onSectionChange(section.id, "content", event.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="closing">Closing</Label>
              <Textarea
                id="closing"
                className="min-h-[120px]"
                value={state.closing}
                onChange={(event) => onChange("closing", event.target.value)}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signatureName">Signature Name</Label>
                <Input
                  id="signatureName"
                  value={state.signatureName}
                  onChange={(event) => onChange("signatureName", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signatureRole">Signature Role</Label>
                <Input
                  id="signatureRole"
                  value={state.signatureRole}
                  onChange={(event) => onChange("signatureRole", event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="footer">Footer</Label>
                <Textarea
                  id="footer"
                  className="min-h-[108px]"
                  value={state.footer}
                  onChange={(event) => onChange("footer", event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bodyNotes">Additional Notes</Label>
            <Textarea
              id="bodyNotes"
              className="min-h-[120px]"
              value={state.bodyNotes}
              onChange={(event) => onChange("bodyNotes", event.target.value)}
            />
          </div>

          <Separator />

          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">Local Drafts</h3>
                  <p className="text-sm text-muted-foreground">
                    Browser-saved drafts and autosave support.
                  </p>
                </div>
                <Button type="button" className="gap-2" onClick={onSaveLocalDraft} disabled={saveLocalPending}>
                  <Save className="h-4 w-4" />
                  Save Local
                </Button>
              </div>

              <div className="space-y-3">
                {localDrafts.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/50 px-4 py-4 text-sm text-muted-foreground">
                    No local drafts saved yet.
                  </p>
                ) : (
                  localDrafts.map((draft) => (
                    <div key={draft.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{draft.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary/70">
                            {labeliseDocumentType(draft.composerState.documentType)}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Updated {formatTimestamp(draft.updatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => onLoadLocalDraft(draft.id)}>
                            Load
                          </Button>
                          <Button type="button" variant="ghost" size="sm" onClick={() => onDeleteLocalDraft(draft.id)}>
                            Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="font-medium text-foreground">Remote Drafts</h3>
                  <p className="text-sm text-muted-foreground">
                    Server-backed drafts tied to the current admin session.
                  </p>
                </div>
                <Button type="button" className="gap-2" onClick={() => onSaveRemoteDraft()} disabled={saveRemotePending}>
                  <Save className="h-4 w-4" />
                  Save Remote
                </Button>
              </div>

              <div className="space-y-3">
                {remoteDrafts.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-border/50 px-4 py-4 text-sm text-muted-foreground">
                    No remote drafts saved yet.
                  </p>
                ) : (
                  remoteDrafts.map((draft) => (
                    <div key={draft.id} className="rounded-xl border border-border/50 bg-background/40 p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-medium text-foreground">{draft.name}</p>
                          <p className="mt-1 text-xs uppercase tracking-[0.16em] text-primary/70">
                            {labeliseDocumentType(draft.documentType)}
                          </p>
                          <p className="mt-2 text-sm text-muted-foreground">
                            Updated {formatTimestamp(draft.updatedAt)}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => onLoadRemoteDraft(draft.id)}>
                            Load
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            disabled={deleteRemotePending}
                            onClick={() => onDeleteRemoteDraft(draft.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                      <div className="mt-3">
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => onSaveRemoteDraft(draft.id)}
                          disabled={saveRemotePending}
                        >
                          Update Existing
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="generatedMarkdown">Generated Markdown + Frontmatter</Label>
            <Textarea id="generatedMarkdown" value={markdown} readOnly className="min-h-[280px] font-mono text-xs" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

