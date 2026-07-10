import {
  coerceDocumentState,
  documentAutosaveStorageKey,
  documentNamedDraftsStorageKey,
  type DocumentComposerState,
} from "@/lib/document-composer";

export type LocalNamedDraft = {
  id: string;
  name: string;
  composerState: DocumentComposerState;
  markdown: string;
  createdAt: string;
  updatedAt: string;
};

type LocalNamedDraftMap = Record<string, LocalNamedDraft>;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readJson<T>(key: string, fallback: T): T {
  if (!canUseStorage()) {
    return fallback;
  }

  const raw = window.localStorage.getItem(key);
  if (!raw) {
    return fallback;
  }

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJson(key: string, value: unknown) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readAutosavedComposerState() {
  const value = readJson<Partial<DocumentComposerState> | null>(documentAutosaveStorageKey, null);
  return value ? coerceDocumentState(value) : null;
}

export function writeAutosavedComposerState(state: DocumentComposerState) {
  writeJson(documentAutosaveStorageKey, state);
}

export function clearAutosavedComposerState() {
  if (canUseStorage()) {
    window.localStorage.removeItem(documentAutosaveStorageKey);
  }
}

export function listLocalNamedDrafts() {
  const records = readJson<LocalNamedDraftMap>(documentNamedDraftsStorageKey, {});
  return Object.values(records)
    .map((draft) => ({
      ...draft,
      composerState: coerceDocumentState(draft.composerState),
    }))
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function saveLocalNamedDraft(input: {
  id?: string;
  name: string;
  composerState: DocumentComposerState;
  markdown: string;
}) {
  const records = readJson<LocalNamedDraftMap>(documentNamedDraftsStorageKey, {});
  const id = input.id || Math.random().toString(36).slice(2, 10);
  const existing = records[id];
  const timestamp = new Date().toISOString();
  const nextDraft: LocalNamedDraft = {
    id,
    name: input.name,
    composerState: coerceDocumentState(input.composerState),
    markdown: input.markdown,
    createdAt: existing?.createdAt || timestamp,
    updatedAt: timestamp,
  };

  records[id] = nextDraft;
  writeJson(documentNamedDraftsStorageKey, records);
  return nextDraft;
}

export function deleteLocalNamedDraft(id: string) {
  const records = readJson<LocalNamedDraftMap>(documentNamedDraftsStorageKey, {});
  delete records[id];
  writeJson(documentNamedDraftsStorageKey, records);
}

export function getLocalNamedDraft(id: string) {
  return listLocalNamedDrafts().find((draft) => draft.id === id) ?? null;
}

