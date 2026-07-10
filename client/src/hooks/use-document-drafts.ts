import { useMutation, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api, type DocumentComposerDraft, type DocumentComposerDraftSaveInput } from "@shared/routes";
import { apiRequest, queryClient } from "@/lib/queryClient";

async function parseResponse<T>(response: Response, schema: z.ZodType<T>) {
  return schema.parse(await response.json());
}

const saveDraftResponseSchema = z.union([
  api.documents.drafts.save.responses[200],
  api.documents.drafts.save.responses[201],
]);

async function fetchDrafts() {
  const response = await fetch(api.documents.drafts.list.path, {
    credentials: "include",
  });

  if (response.status === 401) {
    return [] as DocumentComposerDraft[];
  }

  if (!response.ok) {
    const text = (await response.text()) || response.statusText;
    throw new Error(`${response.status}: ${text}`);
  }

  return api.documents.drafts.list.responses[200].parse(await response.json());
}

export function useDocumentDrafts(enabled: boolean) {
  return useQuery<DocumentComposerDraft[]>({
    queryKey: [api.documents.drafts.list.path],
    enabled,
    queryFn: fetchDrafts,
  });
}

export function useSaveDocumentDraft() {
  return useMutation({
    mutationFn: async (input: DocumentComposerDraftSaveInput) => {
      const validated = api.documents.drafts.save.input.parse(input);
      const response = await apiRequest(
        api.documents.drafts.save.method,
        api.documents.drafts.save.path,
        validated,
      );

      return parseResponse(
        response,
        saveDraftResponseSchema,
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.documents.drafts.list.path] });
    },
  });
}

export function useDeleteDocumentDraft() {
  return useMutation({
    mutationFn: async (draftId: number) => {
      const path = api.documents.drafts.delete.path.replace(":draftId", String(draftId));
      const response = await apiRequest(api.documents.drafts.delete.method, path);
      return parseResponse(response, api.documents.drafts.delete.responses[200]);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.documents.drafts.list.path] });
    },
  });
}
