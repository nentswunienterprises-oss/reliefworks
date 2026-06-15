import { useMutation, useQuery } from "@tanstack/react-query";
import {
  api,
  type AdminClient,
  type AdminQuoteConversionResult,
  type AdminDashboardSummary,
  type AdminLoginInput,
  type AdminProject,
  type AdminQuote,
  type AdminSubscription,
  type AdminCreateQuoteInput,
  type AdminCreateInvoiceInput,
  type AdminSubscriptionEvent,
  type AdminUpdateSubscriptionInput,
  type AdminInvoice,
  type AdminSession,
  type InsertClient,
  type InsertProject,
  type InsertSubscription,
} from "@shared/routes";
import { apiRequest, getQueryFn, queryClient } from "@/lib/queryClient";

export function useAdminSession() {
  return useQuery<AdminSession | null>({
    queryKey: [api.admin.session.path],
    queryFn: getQueryFn<AdminSession | null>({ on401: "returnNull" }),
  });
}

export function useAdminDashboardSummary(enabled: boolean) {
  return useQuery<AdminDashboardSummary>({
    queryKey: [api.admin.dashboardSummary.path],
    enabled,
  });
}

export function useAdminClients(enabled: boolean) {
  return useQuery<AdminClient[]>({
    queryKey: [api.admin.clients.list.path],
    enabled,
  });
}

export function useAdminProjects(enabled: boolean) {
  return useQuery<AdminProject[]>({
    queryKey: [api.admin.projects.list.path],
    enabled,
  });
}

export function useAdminQuotes(enabled: boolean) {
  return useQuery<AdminQuote[]>({
    queryKey: [api.admin.quotes.list.path],
    enabled,
  });
}

export function useAdminInvoices(enabled: boolean) {
  return useQuery<AdminInvoice[]>({
    queryKey: [api.admin.invoices.list.path],
    enabled,
  });
}

export function useAdminSubscriptions(enabled: boolean) {
  return useQuery<AdminSubscription[]>({
    queryKey: [api.admin.subscriptions.list.path],
    enabled,
  });
}

export function useAdminSubscriptionEvents(enabled: boolean) {
  return useQuery<AdminSubscriptionEvent[]>({
    queryKey: [api.admin.subscriptions.events.list.path],
    enabled,
  });
}

export function useAdminLogin() {
  return useMutation({
    mutationFn: async (input: AdminLoginInput) => {
      const validated = api.admin.login.input.parse(input);
      const res = await apiRequest(api.admin.login.method, api.admin.login.path, validated);
      return api.admin.login.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.session.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useAdminLogout() {
  return useMutation({
    mutationFn: async () => {
      const res = await apiRequest(api.admin.logout.method, api.admin.logout.path);
      return api.admin.logout.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      queryClient.setQueryData([api.admin.session.path], {
        isAuthenticated: false,
        user: null,
      });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useCreateAdminClient() {
  return useMutation({
    mutationFn: async (input: InsertClient) => {
      const validated = api.admin.clients.create.input.parse(input);
      const res = await apiRequest(api.admin.clients.create.method, api.admin.clients.create.path, validated);
      return api.admin.clients.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.clients.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useCreateAdminProject() {
  return useMutation({
    mutationFn: async (input: InsertProject) => {
      const validated = api.admin.projects.create.input.parse(input);
      const res = await apiRequest(api.admin.projects.create.method, api.admin.projects.create.path, validated);
      return api.admin.projects.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.projects.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useCreateAdminQuote() {
  return useMutation({
    mutationFn: async (input: AdminCreateQuoteInput) => {
      const validated = api.admin.quotes.create.input.parse(input);
      const res = await apiRequest(api.admin.quotes.create.method, api.admin.quotes.create.path, validated);
      return api.admin.quotes.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.quotes.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useConvertAdminQuote() {
  return useMutation({
    mutationFn: async (quoteId: number) => {
      const path = api.admin.quotes.convert.path.replace(":quoteId", String(quoteId));
      const res = await apiRequest(api.admin.quotes.convert.method, path);
      return api.admin.quotes.convert.responses[200].parse(await res.json()) as AdminQuoteConversionResult;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.projects.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.quotes.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.invoices.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useCreateAdminInvoice() {
  return useMutation({
    mutationFn: async (input: AdminCreateInvoiceInput) => {
      const validated = api.admin.invoices.create.input.parse(input);
      const res = await apiRequest(api.admin.invoices.create.method, api.admin.invoices.create.path, validated);
      return api.admin.invoices.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.invoices.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useCreateAdminSubscription() {
  return useMutation({
    mutationFn: async (input: InsertSubscription) => {
      const validated = api.admin.subscriptions.create.input.parse(input);
      const res = await apiRequest(api.admin.subscriptions.create.method, api.admin.subscriptions.create.path, validated);
      return api.admin.subscriptions.create.responses[201].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.subscriptions.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.subscriptions.events.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}

export function useUpdateAdminSubscription() {
  return useMutation({
    mutationFn: async ({ subscriptionId, input }: { subscriptionId: number; input: AdminUpdateSubscriptionInput }) => {
      const validated = api.admin.subscriptions.update.input.parse(input);
      const path = api.admin.subscriptions.update.path.replace(":subscriptionId", String(subscriptionId));
      const res = await apiRequest(api.admin.subscriptions.update.method, path, validated);
      return api.admin.subscriptions.update.responses[200].parse(await res.json());
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: [api.admin.subscriptions.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.subscriptions.events.list.path] });
      await queryClient.invalidateQueries({ queryKey: [api.admin.dashboardSummary.path] });
    },
  });
}