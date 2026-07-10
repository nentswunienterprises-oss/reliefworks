import { marked } from "marked";

export const documentTypeOptions = ["letter", "proposal", "quotation"] as const;

export type DocumentType = (typeof documentTypeOptions)[number];

export type DocumentSection = {
  id: string;
  heading: string;
  content: string;
};

export type DocumentComposerState = {
  documentType: DocumentType;
  draftName: string;
  documentTitle: string;
  clientName: string;
  date: string;
  referenceNumber: string;
  footer: string;
  recipientName: string;
  recipientEmail: string;
  subjectLine: string;
  intro: string;
  summary: string;
  closing: string;
  signatureName: string;
  signatureRole: string;
  sections: DocumentSection[];
  bodyNotes: string;
};

export type DocumentFrontmatter = {
  documentTitle: string;
  clientName: string;
  date: string;
  referenceNumber: string;
  footer: string;
  recipientName?: string;
  recipientEmail?: string;
  subjectLine?: string;
  documentType?: string;
};

export type DocumentOverrides = Partial<DocumentFrontmatter>;

export type ParsedMarkdownDocument = {
  frontmatter: DocumentFrontmatter;
  body: string;
};

export type RenderedDocument = {
  html: string;
  subjectLine: string;
  plainText: string;
  fileName: string;
  frontmatter: DocumentFrontmatter;
  bodyHtml: string;
};

export const reliefDocumentBrand = {
  companyName: "Relief Works Technologies",
  footer:
    "Relief Works Technologies (Pty) Ltd | systems, products, and identities that remove pressure.",
  referencePrefixes: {
    letter: "RW-LTR",
    proposal: "RW-PRP",
    quotation: "RW-QTN",
  } satisfies Record<DocumentType, string>,
  colors: {
    background: "#040414",
    surface: "#0b141d",
    mutedSurface: "#121d29",
    border: "rgba(255,255,255,0.12)",
    text: "#ffffff",
    mutedText: "rgba(255,255,255,0.68)",
    accent: "#d7e7ff",
    line: "rgba(255,255,255,0.18)",
  },
} as const;

const documentDefaults: Record<
  DocumentType,
  {
    title: string;
    subjectLine: string;
    intro: string;
    summary: string;
    closing: string;
    sections: Array<{ heading: string; content: string }>;
  }
> = {
  letter: {
    title: "Letter of Relief",
    subjectLine: "Relief Works correspondence",
    intro:
      "Thank you for the opportunity to review your current position. This letter captures the pressure we understand, the response we recommend, and the path forward.",
    summary:
      "This document is intended to create clarity, remove uncertainty, and establish the next deliberate move.",
    closing:
      "If this reflects your situation accurately, we can proceed with the next practical step from here.",
    sections: [
      {
        heading: "Current Pressure",
        content:
          "Outline the weight, delays, or uncertainty currently affecting the client.",
      },
      {
        heading: "Recommended Response",
        content:
          "Describe the most direct intervention Relief Works should make first.",
      },
    ],
  },
  proposal: {
    title: "Proposal for Relief",
    subjectLine: "Relief Works proposal",
    intro:
      "This proposal defines the structure through which Relief Works will reduce pressure and translate the original vision into coherent execution.",
    summary:
      "The aim is not more motion. The aim is a system, product, or identity that makes progress feel lighter and more controlled.",
    closing:
      "We recommend moving only if this scope preserves the integrity of the vision and reduces real pressure.",
    sections: [
      {
        heading: "Objective",
        content:
          "State the desired outcome and what Relief Works is protecting or restoring.",
      },
      {
        heading: "Scope of Work",
        content:
          "List the key deliverables, interventions, or system changes included in this proposal.",
      },
      {
        heading: "Commercial Structure",
        content:
          "Capture the investment, billing shape, or commercial notes the client should review.",
      },
    ],
  },
  quotation: {
    title: "Quotation for Relief",
    subjectLine: "Relief Works quotation",
    intro:
      "This quotation records the commercial terms for the work required to reduce the identified pressure and move the engagement into execution.",
    summary:
      "It should be read alongside the agreed scope, deliverables, and timing assumptions.",
    closing:
      "Please review the commercial terms carefully. Once approved, we can begin the work in a controlled way.",
    sections: [
      {
        heading: "Included Scope",
        content:
          "List the deliverables, systems, or creative outputs covered by this quotation.",
      },
      {
        heading: "Timing and Assumptions",
        content:
          "Note the expected timeline, dependencies, approvals, or assumptions that affect delivery.",
      },
      {
        heading: "Commercial Terms",
        content:
          "Describe pricing terms, payment milestones, and any important exclusions.",
      },
    ],
  },
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function createTodayIsoDate() {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function formatDateStamp(input: string) {
  const value = input || createTodayIsoDate();
  return value.replace(/-/g, "");
}

function createSectionId() {
  return Math.random().toString(36).slice(2, 10);
}

export function createDefaultReferenceNumber(documentType: DocumentType, date = createTodayIsoDate()) {
  return `${reliefDocumentBrand.referencePrefixes[documentType]}-${formatDateStamp(date)}`;
}

export function createDocumentSections(documentType: DocumentType): DocumentSection[] {
  return documentDefaults[documentType].sections.map((section) => ({
    id: createSectionId(),
    heading: section.heading,
    content: section.content,
  }));
}

export function createDefaultDocumentState(
  documentType: DocumentType = "letter",
): DocumentComposerState {
  const defaults = documentDefaults[documentType];
  const date = createTodayIsoDate();

  return {
    documentType,
    draftName: `${documentType[0].toUpperCase()}${documentType.slice(1)} draft`,
    documentTitle: defaults.title,
    clientName: "",
    date,
    referenceNumber: createDefaultReferenceNumber(documentType, date),
    footer: reliefDocumentBrand.footer,
    recipientName: "",
    recipientEmail: "",
    subjectLine: defaults.subjectLine,
    intro: defaults.intro,
    summary: defaults.summary,
    closing: defaults.closing,
    signatureName: "Relief Works",
    signatureRole: "Operational & Creative Relief",
    sections: createDocumentSections(documentType),
    bodyNotes: "",
  };
}

export function applyDocumentTypeDefaults(
  state: DocumentComposerState,
  documentType: DocumentType,
): DocumentComposerState {
  const defaults = documentDefaults[documentType];
  const nextDate = state.date || createTodayIsoDate();

  return {
    ...state,
    documentType,
    documentTitle:
      state.documentTitle && state.documentTitle !== documentDefaults[state.documentType].title
        ? state.documentTitle
        : defaults.title,
    subjectLine:
      state.subjectLine && state.subjectLine !== documentDefaults[state.documentType].subjectLine
        ? state.subjectLine
        : defaults.subjectLine,
    intro:
      state.intro && state.intro !== documentDefaults[state.documentType].intro
        ? state.intro
        : defaults.intro,
    summary:
      state.summary && state.summary !== documentDefaults[state.documentType].summary
        ? state.summary
        : defaults.summary,
    closing:
      state.closing && state.closing !== documentDefaults[state.documentType].closing
        ? state.closing
        : defaults.closing,
    referenceNumber: createDefaultReferenceNumber(documentType, nextDate),
    sections: createDocumentSections(documentType),
  };
}

function normaliseField(value: string) {
  return value.replace(/\r\n/g, "\n").trim();
}

function quoteFrontmatterValue(value: string) {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
  return `"${escaped}"`;
}

export function serializeFrontmatter(frontmatter: DocumentFrontmatter) {
  return [
    "---",
    `documentTitle: ${quoteFrontmatterValue(frontmatter.documentTitle)}`,
    `clientName: ${quoteFrontmatterValue(frontmatter.clientName)}`,
    `date: ${quoteFrontmatterValue(frontmatter.date)}`,
    `referenceNumber: ${quoteFrontmatterValue(frontmatter.referenceNumber)}`,
    `footer: ${quoteFrontmatterValue(frontmatter.footer)}`,
    `recipientName: ${quoteFrontmatterValue(frontmatter.recipientName || "")}`,
    `recipientEmail: ${quoteFrontmatterValue(frontmatter.recipientEmail || "")}`,
    `subjectLine: ${quoteFrontmatterValue(frontmatter.subjectLine || "")}`,
    `documentType: ${quoteFrontmatterValue(frontmatter.documentType || "")}`,
    "---",
  ].join("\n");
}

export function buildDocumentFrontmatter(state: DocumentComposerState): DocumentFrontmatter {
  return {
    documentTitle: normaliseField(state.documentTitle) || documentDefaults[state.documentType].title,
    clientName: normaliseField(state.clientName),
    date: normaliseField(state.date) || createTodayIsoDate(),
    referenceNumber:
      normaliseField(state.referenceNumber) ||
      createDefaultReferenceNumber(state.documentType, state.date),
    footer: normaliseField(state.footer) || reliefDocumentBrand.footer,
    recipientName: normaliseField(state.recipientName),
    recipientEmail: normaliseField(state.recipientEmail),
    subjectLine: normaliseField(state.subjectLine) || documentDefaults[state.documentType].subjectLine,
    documentType: state.documentType,
  };
}

export function buildDocumentMarkdown(state: DocumentComposerState) {
  const frontmatter = buildDocumentFrontmatter(state);
  const bodyParts: string[] = [];

  if (normaliseField(state.intro)) {
    bodyParts.push(normaliseField(state.intro));
  }

  if (normaliseField(state.summary)) {
    bodyParts.push(`> ${normaliseField(state.summary).replace(/\n/g, "\n> ")}`);
  }

  state.sections.forEach((section) => {
    const heading = normaliseField(section.heading);
    const content = normaliseField(section.content);
    if (!heading && !content) {
      return;
    }

    if (heading) {
      bodyParts.push(`## ${heading}`);
    }

    if (content) {
      bodyParts.push(content);
    }
  });

  if (normaliseField(state.bodyNotes)) {
    bodyParts.push("## Notes");
    bodyParts.push(normaliseField(state.bodyNotes));
  }

  if (normaliseField(state.closing)) {
    bodyParts.push(normaliseField(state.closing));
  }

  const signatureLines = [normaliseField(state.signatureName), normaliseField(state.signatureRole)].filter(
    Boolean,
  );

  if (signatureLines.length > 0) {
    bodyParts.push(signatureLines.join("\n"));
  }

  return `${serializeFrontmatter(frontmatter)}\n\n${bodyParts.join("\n\n").trim()}\n`;
}

function stripWrappingQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, "\\");
  }

  return trimmed;
}

export function parseMarkdownDocument(markdown: string): ParsedMarkdownDocument {
  const source = markdown.replace(/\r\n/g, "\n");

  if (!source.startsWith("---\n")) {
    throw new Error("Document markdown must start with frontmatter.");
  }

  const end = source.indexOf("\n---\n", 4);
  if (end === -1) {
    throw new Error("Document markdown frontmatter is not closed.");
  }

  const rawFrontmatter = source.slice(4, end);
  const body = source.slice(end + 5).trim();
  const entries = rawFrontmatter
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const separatorIndex = line.indexOf(":");
      if (separatorIndex === -1) {
        return null;
      }

      const key = line.slice(0, separatorIndex).trim();
      const value = stripWrappingQuotes(line.slice(separatorIndex + 1));
      return [key, value] as const;
    })
    .filter((entry): entry is readonly [string, string] => Boolean(entry));

  const frontmatterRecord = Object.fromEntries(entries);
  const frontmatter: DocumentFrontmatter = {
    documentTitle: frontmatterRecord.documentTitle || "Untitled Document",
    clientName: frontmatterRecord.clientName || "",
    date: frontmatterRecord.date || createTodayIsoDate(),
    referenceNumber: frontmatterRecord.referenceNumber || "",
    footer: frontmatterRecord.footer || reliefDocumentBrand.footer,
    recipientName: frontmatterRecord.recipientName || "",
    recipientEmail: frontmatterRecord.recipientEmail || "",
    subjectLine: frontmatterRecord.subjectLine || "",
    documentType: frontmatterRecord.documentType || "",
  };

  return { frontmatter, body };
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeMarkdownHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;");
}

function replaceKnownTokens(input: string, frontmatter: DocumentFrontmatter) {
  return input
    .replace(/\{\{CLIENT_NAME\}\}/g, frontmatter.clientName || "Client")
    .replace(/\{\{DOCUMENT_TITLE\}\}/g, frontmatter.documentTitle)
    .replace(/\{\{DATE\}\}/g, frontmatter.date)
    .replace(/\{\{REFERENCE_NUMBER\}\}/g, frontmatter.referenceNumber || "")
    .replace(/\{\{FOOTER\}\}/g, frontmatter.footer || reliefDocumentBrand.footer);
}

export function renderMarkdownBodyHtml(body: string, frontmatter: DocumentFrontmatter) {
  const resolvedBody = escapeMarkdownHtml(replaceKnownTokens(body, frontmatter));
  const rendered = marked.parse(resolvedBody, {
    gfm: true,
    breaks: true,
  });
  return typeof rendered === "string" ? rendered : "";
}

function buildPlainText(body: string, frontmatter: DocumentFrontmatter) {
  return [frontmatter.documentTitle, frontmatter.clientName, body]
    .filter(Boolean)
    .join("\n\n")
    .replace(/[#>*_`-]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function buildFileName(documentTitle: string, fallback: string) {
  const base = (documentTitle || fallback)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || fallback;
}

function buildLogoMarkup() {
  return `
    <div style="display:inline-flex;align-items:flex-end;gap:10px;">
      <div style="display:flex;flex-direction:column;align-items:flex-start;">
        <span style="font-family:'Libre Baskerville', Georgia, serif;font-size:30px;line-height:1;color:#ffffff;letter-spacing:-0.04em;">Relief Works</span>
        <span style="font-family:'DM Sans', Arial, sans-serif;font-size:10px;line-height:1.2;text-transform:uppercase;letter-spacing:0.32em;color:rgba(255,255,255,0.72);margin-top:6px;">Technologies</span>
      </div>
    </div>
  `.trim();
}

function injectTemplate(template: string, values: Record<string, string>) {
  return Object.entries(values).reduce((html, [key, value]) => {
    return html.replace(new RegExp(`\\{\\{${key}\\}\\}`, "g"), () => value);
  }, template);
}

function buildEmailTemplate() {
  const colors = reliefDocumentBrand.colors;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{DOCUMENT_TITLE}}</title>
  </head>
  <body style="margin:0;padding:32px 0;background:${colors.background};font-family:'DM Sans',Arial,sans-serif;color:${colors.text};">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="border-collapse:collapse;">
      <tr>
        <td align="center">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:720px;border-collapse:collapse;">
            <tr>
              <td style="padding:0 24px 20px 24px;">
                ${buildLogoMarkup()}
              </td>
            </tr>
            <tr>
              <td style="padding:0 24px;">
                <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:${colors.surface};border:1px solid ${colors.border};border-radius:22px;overflow:hidden;border-collapse:separate;">
                  <tr>
                    <td style="padding:28px 32px;border-bottom:1px solid ${colors.line};">
                      <div style="display:flex;justify-content:space-between;gap:16px;flex-wrap:wrap;">
                        <div>
                          <p style="margin:0 0 8px 0;font-size:11px;line-height:1.4;text-transform:uppercase;letter-spacing:0.24em;color:${colors.mutedText};">Document</p>
                          <h1 style="margin:0;font-family:'Libre Baskerville',Georgia,serif;font-size:34px;line-height:1.15;color:${colors.text};">{{DOCUMENT_TITLE}}</h1>
                        </div>
                        <div style="min-width:220px;">
                          <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${colors.mutedText};">Client: <span style="color:${colors.text};">{{CLIENT_NAME}}</span></p>
                          <p style="margin:0 0 8px 0;font-size:12px;line-height:1.6;color:${colors.mutedText};">Date: <span style="color:${colors.text};">{{DATE}}</span></p>
                          <p style="margin:0;font-size:12px;line-height:1.6;color:${colors.mutedText};">Reference: <span style="color:${colors.text};">{{REFERENCE_NUMBER}}</span></p>
                        </div>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:32px;">
                      <div style="font-size:15px;line-height:1.8;color:${colors.text};">
                        {{BODY}}
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding:22px 32px;background:${colors.mutedSurface};border-top:1px solid ${colors.line};">
                      <p style="margin:0;font-size:12px;line-height:1.7;color:${colors.mutedText};">{{FOOTER}}</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function buildPdfTemplate() {
  const colors = reliefDocumentBrand.colors;
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{{DOCUMENT_TITLE}}</title>
    <style>
      @page {
        size: A4;
        margin: 18mm 16mm 20mm 16mm;
      }

      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        font-family: "DM Sans", Arial, sans-serif;
        color: ${colors.text};
        background: ${colors.background};
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      .page-shell {
        position: relative;
        min-height: calc(100vh - 2px);
      }

      .frame {
        position: fixed;
        inset: 10mm;
        border: 1px solid rgba(255,255,255,0.14);
        border-radius: 22px;
        pointer-events: none;
      }

      .reference-background {
        position: fixed;
        inset: 0;
        opacity: 0.07;
        background:
          radial-gradient(circle at top right, rgba(215,231,255,0.65), transparent 40%),
          linear-gradient(135deg, rgba(255,255,255,0.08), transparent 36%);
        pointer-events: none;
        display: {{REFERENCE_BACKGROUND_DISPLAY}};
      }

      header {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        align-items: flex-start;
        padding-bottom: 18px;
        border-bottom: 1px solid rgba(255,255,255,0.18);
      }

      .wordmark {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .wordmark-title {
        font-family: "Libre Baskerville", Georgia, serif;
        font-size: 29px;
        line-height: 1;
        letter-spacing: -0.04em;
      }

      .wordmark-subtitle {
        font-size: 9px;
        line-height: 1.3;
        text-transform: uppercase;
        letter-spacing: 0.34em;
        color: rgba(255,255,255,0.72);
      }

      .meta {
        min-width: 220px;
        padding: 14px 16px;
        border: 1px solid rgba(255,255,255,0.12);
        border-radius: 16px;
        background: rgba(11,20,29,0.88);
      }

      .meta-row {
        display: flex;
        justify-content: space-between;
        gap: 20px;
        font-size: 11px;
        line-height: 1.6;
        color: rgba(255,255,255,0.72);
      }

      .meta-row + .meta-row {
        margin-top: 6px;
      }

      .meta-value {
        color: ${colors.text};
        text-align: right;
      }

      main {
        padding-top: 24px;
      }

      h1 {
        margin: 0 0 18px 0;
        font-family: "Libre Baskerville", Georgia, serif;
        font-size: 34px;
        line-height: 1.16;
      }

      h2 {
        margin: 30px 0 10px;
        font-family: "Libre Baskerville", Georgia, serif;
        font-size: 18px;
        line-height: 1.3;
      }

      p, li, blockquote {
        font-size: 13px;
        line-height: 1.85;
        color: ${colors.text};
      }

      ul, ol {
        padding-left: 18px;
      }

      blockquote {
        margin: 18px 0;
        padding: 12px 16px;
        border-left: 3px solid rgba(255,255,255,0.28);
        background: rgba(255,255,255,0.04);
        color: rgba(255,255,255,0.82);
      }

      footer {
        margin-top: 36px;
        padding-top: 18px;
        border-top: 1px solid rgba(255,255,255,0.18);
        font-size: 11px;
        line-height: 1.7;
        color: rgba(255,255,255,0.72);
      }
    </style>
  </head>
  <body>
    <div class="reference-background"></div>
    <div class="frame"></div>
    <div class="page-shell">
      <header>
        <div class="wordmark">
          <div class="wordmark-title">Relief Works</div>
          <div class="wordmark-subtitle">Technologies</div>
        </div>
        <div class="meta">
          <div class="meta-row"><span>Client</span><span class="meta-value">{{CLIENT_NAME}}</span></div>
          <div class="meta-row"><span>Date</span><span class="meta-value">{{DATE}}</span></div>
          <div class="meta-row"><span>Reference</span><span class="meta-value">{{REFERENCE_NUMBER}}</span></div>
        </div>
      </header>
      <main>
        <h1>{{DOCUMENT_TITLE}}</h1>
        {{BODY}}
      </main>
      <footer>{{FOOTER}}</footer>
    </div>
  </body>
</html>`;
}

function renderTemplate(
  markdown: string,
  template: string,
  overrides: DocumentOverrides = {},
  extraTokens: Record<string, string> = {},
): RenderedDocument {
  const parsed = parseMarkdownDocument(markdown);
  const frontmatter: DocumentFrontmatter = {
    ...parsed.frontmatter,
    ...Object.fromEntries(
      Object.entries(overrides).filter(([, value]) => typeof value === "string"),
    ),
  };
  const bodyHtml = renderMarkdownBodyHtml(parsed.body, frontmatter);
  const html = injectTemplate(template, {
    BODY: bodyHtml,
    DATE: escapeHtml(frontmatter.date || ""),
    DOCUMENT_TITLE: escapeHtml(frontmatter.documentTitle || "Document"),
    CLIENT_NAME: escapeHtml(frontmatter.clientName || "Client"),
    REFERENCE_NUMBER: escapeHtml(frontmatter.referenceNumber || ""),
    FOOTER: escapeHtml(frontmatter.footer || reliefDocumentBrand.footer),
    ...extraTokens,
  });

  return {
    html,
    subjectLine: frontmatter.subjectLine || frontmatter.documentTitle,
    plainText: buildPlainText(parsed.body, frontmatter),
    fileName: buildFileName(frontmatter.documentTitle, "relief-works-document"),
    frontmatter,
    bodyHtml,
  };
}

export function renderEmailHtmlFromMarkdown(
  markdown: string,
  overrides: DocumentOverrides = {},
) {
  return renderTemplate(markdown, buildEmailTemplate(), overrides);
}

export function renderPdfHtmlFromMarkdown(
  markdown: string,
  overrides: DocumentOverrides = {},
  useReferenceBackground = false,
) {
  return renderTemplate(markdown, buildPdfTemplate(), overrides, {
    REFERENCE_BACKGROUND_DISPLAY: useReferenceBackground ? "block" : "none",
  });
}

export function coerceDocumentState(input: Partial<DocumentComposerState> | null | undefined) {
  const base = createDefaultDocumentState(
    input?.documentType && documentTypeOptions.includes(input.documentType)
      ? input.documentType
      : "letter",
  );

  return {
    ...base,
    ...input,
    sections:
      input?.sections?.map((section) => ({
        id: section.id || createSectionId(),
        heading: section.heading || "",
        content: section.content || "",
      })) ?? base.sections,
  } satisfies DocumentComposerState;
}
