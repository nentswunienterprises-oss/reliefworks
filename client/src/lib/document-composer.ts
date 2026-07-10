export {
  applyDocumentTypeDefaults,
  buildDocumentFrontmatter,
  buildDocumentMarkdown,
  coerceDocumentState,
  createDefaultDocumentState,
  createDefaultReferenceNumber,
  createDocumentSections,
  documentTypeOptions,
  renderEmailHtmlFromMarkdown,
  renderPdfHtmlFromMarkdown,
  reliefDocumentBrand,
  type DocumentComposerState,
  type DocumentSection,
  type DocumentType,
} from "@shared/document-generator";

export const documentAutosaveStorageKey = "reliefworks.document-composer.autosave";
export const documentNamedDraftsStorageKey = "reliefworks.document-composer.named-drafts";
