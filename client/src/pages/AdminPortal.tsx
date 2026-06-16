import { useState } from "react";

import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  useAdminClients,
  useAdminDashboardSummary,
  useAdminInvoices,
  useAdminLogin,
  useAdminLogout,
  useAdminProjects,
  useAdminQuotes,
  useAdminSession,
  useAdminSubscriptionEvents,
  useAdminSubscriptions,
  useConvertAdminQuote,
  useCreateAdminClient,
  useCreateAdminInvoice,
  useCreateAdminProject,
  useCreateAdminQuote,
  useCreateAdminSubscription,
  useUpdateAdminSubscription,
} from "@/hooks/use-admin";
import { useToast } from "@/hooks/use-toast";
import type { AdminProject, AdminQuote } from "@shared/routes";
import type {
  BillingModel,
  ClientStatus,
  PaymentTermsType,
  SubscriptionInterval,
  SubscriptionStatus,
  SupportedCurrency,
} from "@shared/schema";

function getDefaultPaymentTerms(project: AdminProject | null): {
  paymentTermsType: PaymentTermsType;
  depositPercentage: string;
  paymentTermsNote: string;
} {
  if (!project) {
    return {
      paymentTermsType: "full_upfront",
      depositPercentage: "100",
      paymentTermsNote: "",
    };
  }

  if (project.billingModel === "retainer") {
    return {
      paymentTermsType: "retainer",
      depositPercentage: "100",
      paymentTermsNote: "Billed monthly in advance for the active service period.",
    };
  }

  if (project.billingModel === "hybrid") {
    return {
      paymentTermsType: "split_50_50",
      depositPercentage: "50",
      paymentTermsNote: "50% upfront to begin, with the remaining balance due on completion.",
    };
  }

  return {
    paymentTermsType: "full_upfront",
    depositPercentage: "100",
    paymentTermsNote: "Full payment is due before implementation begins.",
  };
}

export default function AdminPortal() {
  const { toast } = useToast();
  const sessionQuery = useAdminSession();
  const loginMutation = useAdminLogin();
  const logoutMutation = useAdminLogout();
  const createClientMutation = useCreateAdminClient();
  const createProjectMutation = useCreateAdminProject();
  const createQuoteMutation = useCreateAdminQuote();
  const createInvoiceMutation = useCreateAdminInvoice();
  const convertQuoteMutation = useConvertAdminQuote();
  const createSubscriptionMutation = useCreateAdminSubscription();
  const updateSubscriptionMutation = useUpdateAdminSubscription();

  const [email, setEmail] = useState("admin@reliefworks.local");
  const [password, setPassword] = useState("change-me");
  const [clientForm, setClientForm] = useState<{
    name: string;
    primaryContactName: string;
    primaryContactEmail: string;
    primaryContactPhone: string;
    companyName: string;
    status: ClientStatus;
    notes: string;
  }>({
    name: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    companyName: "",
    status: "lead",
    notes: "",
  });
  const [projectForm, setProjectForm] = useState<{
    clientId: string;
    name: string;
    description: string;
    billingModel: BillingModel;
    currency: SupportedCurrency;
    oneOffAmount: string;
    monthlyRetainerAmount: string;
    estimatedRetainerMonths: string;
  }>({
    clientId: "",
    name: "",
    description: "",
    billingModel: "one_off",
    currency: "ZAR",
    oneOffAmount: "",
    monthlyRetainerAmount: "",
    estimatedRetainerMonths: "6",
  });
  const [quoteForm, setQuoteForm] = useState<{
    clientId: string;
    projectId: string;
    title: string;
    scope: string;
    currency: SupportedCurrency;
    recipientEmail: string;
    subtotal: string;
    taxAmount: string;
    paymentTermsType: PaymentTermsType;
    depositPercentage: string;
    paymentTermsNote: string;
    expiresAt: string;
  }>({
    clientId: "",
    projectId: "",
    title: "",
    scope: "",
    currency: "ZAR",
    recipientEmail: "",
    subtotal: "",
    taxAmount: "0",
    paymentTermsType: "full_upfront",
    depositPercentage: "100",
    paymentTermsNote: "",
    expiresAt: "",
  });
  const [invoiceForm, setInvoiceForm] = useState<{
    clientId: string;
    projectId: string;
    quoteId: string;
    currency: SupportedCurrency;
    subtotal: string;
    taxAmount: string;
    paymentTermsType: PaymentTermsType;
    depositPercentage: string;
    paymentTermsNote: string;
    dueAt: string;
    createPaymentLink: boolean;
  }>({
    clientId: "",
    projectId: "",
    quoteId: "",
    currency: "ZAR",
    subtotal: "",
    taxAmount: "0",
    paymentTermsType: "full_upfront",
    depositPercentage: "100",
    paymentTermsNote: "",
    dueAt: "",
    createPaymentLink: true,
  });
  const [subscriptionForm, setSubscriptionForm] = useState<{
    clientId: string;
    projectId: string;
    name: string;
    status: SubscriptionStatus;
    currency: SupportedCurrency;
    amount: string;
    interval: SubscriptionInterval;
  }>({
    clientId: "",
    projectId: "",
    name: "",
    status: "pending",
    currency: "ZAR",
    amount: "",
    interval: "month",
  });
  const [workspaceClientId, setWorkspaceClientId] = useState("");
  const [workspaceProjectId, setWorkspaceProjectId] = useState("");
  const [workspaceQuoteId, setWorkspaceQuoteId] = useState("");

  const session = sessionQuery.data;
  const isAuthenticated = Boolean(session?.isAuthenticated);
  const dashboardQuery = useAdminDashboardSummary(isAuthenticated);
  const clientsQuery = useAdminClients(isAuthenticated);
  const projectsQuery = useAdminProjects(isAuthenticated);
  const quotesQuery = useAdminQuotes(isAuthenticated);
  const invoicesQuery = useAdminInvoices(isAuthenticated);
  const subscriptionsQuery = useAdminSubscriptions(isAuthenticated);
  const subscriptionEventsQuery = useAdminSubscriptionEvents(isAuthenticated);

  const clients = clientsQuery.data ?? [];
  const projects = projectsQuery.data ?? [];
  const quotes = quotesQuery.data ?? [];
  const invoices = invoicesQuery.data ?? [];
  const subscriptions = subscriptionsQuery.data ?? [];
  const subscriptionEvents = subscriptionEventsQuery.data ?? [];

  const selectedClient =
    clients.find((client) => String(client.id) === workspaceClientId) ?? null;
  const selectedProject =
    projects.find((project) => String(project.id) === workspaceProjectId) ?? null;
  const selectedQuote =
    quotes.find((quote) => String(quote.id) === workspaceQuoteId) ?? null;

  function getProjectEstimatedMonths(project: AdminProject | null) {
    return project?.estimatedRetainerMonths ?? null;
  }

  function getProjectBuildAmount(project: AdminProject | null) {
    return Number(project?.oneOffAmount || "0");
  }

  function getProjectMonthlyAmount(project: AdminProject | null) {
    return Number(project?.monthlyRetainerAmount || "0");
  }

  function getProjectQuoteSubtotal(project: AdminProject | null) {
    if (!project) {
      return "";
    }

    const buildAmount = getProjectBuildAmount(project);
    const monthlyAmount = getProjectMonthlyAmount(project);
    const estimatedMonths = Number(project.estimatedRetainerMonths || 1);

    if (project.billingModel === "retainer") {
      return (monthlyAmount * estimatedMonths).toFixed(2);
    }

    if (project.billingModel === "hybrid") {
      return buildAmount.toFixed(2);
    }

    return project.oneOffAmount || "";
  }

  function getProjectQuoteTitle(project: AdminProject | null) {
    if (!project) {
      return "";
    }

    if (project.billingModel === "retainer") {
      return `${project.name} Retainer`;
    }

    return project.name;
  }

  function getProjectQuoteScope(project: AdminProject | null) {
    if (!project) {
      return "";
    }

    const baseScope = (project.description || project.name).trim();

    if (project.billingModel === "retainer" || project.billingModel === "hybrid") {
      const estimatedMonths = getProjectEstimatedMonths(project);
      const billingLines: string[] = [];

      if (project.oneOffAmount) {
        billingLines.push(`- Setup/build amount: ${project.currency} ${project.oneOffAmount}`);
      }

      if (project.billingModel === "hybrid") {
        billingLines.push(
          `- Monthly maintenance: ${project.currency} ${project.monthlyRetainerAmount || "0.00"} per month until cancelled`,
        );
      } else {
        billingLines.push(
          `- Monthly maintenance: ${project.currency} ${project.monthlyRetainerAmount || "0.00"} per month`,
        );
        if (estimatedMonths) {
          billingLines.push(
            `- Estimated term: ${estimatedMonths} month${estimatedMonths === 1 ? "" : "s"}`,
          );
        }
      }

      return [baseScope, "## Relief Works Billing Context", billingLines.join("\n")].join("\n\n");
    }

    return baseScope;
  }

  function getQuoteApprovalHref(quote: AdminQuote) {
    if (!quote.approvalToken) {
      return null;
    }

    if (typeof window === "undefined") {
      return `/quote/${quote.approvalToken}`;
    }

    return new URL(`/quote/${quote.approvalToken}`, window.location.origin).toString();
  }

  async function handleCopyQuoteApprovalLink(quote: AdminQuote) {
    const approvalLink = getQuoteApprovalHref(quote);
    if (!approvalLink) {
      return;
    }

    try {
      await navigator.clipboard.writeText(approvalLink);
      toast({
        title: "Approval link copied",
        description: `The client approval link for ${quote.quoteNumber} is ready to share.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: error instanceof Error ? error.message : "Unable to copy the approval link.",
        variant: "destructive",
      });
    }
  }

  function applyClientWorkspace(clientId: string) {
    if (!clientId) {
      setWorkspaceClientId("");
      setWorkspaceProjectId("");
      setWorkspaceQuoteId("");
      return;
    }

    setWorkspaceClientId(clientId);
    setWorkspaceProjectId("");
    setWorkspaceQuoteId("");

    const client = clients.find((item) => String(item.id) === clientId);

    setProjectForm((current) => ({ ...current, clientId }));
    setQuoteForm((current) => ({
      ...current,
      clientId,
      projectId: "",
      title: "",
      scope: "",
      recipientEmail: client?.primaryContactEmail || current.recipientEmail,
    }));
    setInvoiceForm((current) => ({ ...current, clientId, projectId: "", quoteId: "" }));
    setSubscriptionForm((current) => ({ ...current, clientId, projectId: "" }));
  }

  function applyProjectWorkspace(projectId: string) {
    if (!projectId) {
      setWorkspaceProjectId("");
      setWorkspaceQuoteId("");
      setQuoteForm((current) => ({
        ...current,
        projectId: "",
        title: "",
        scope: "",
        subtotal: "",
        paymentTermsType: "full_upfront",
        depositPercentage: "100",
        paymentTermsNote: "",
      }));
      setInvoiceForm((current) => ({
        ...current,
        projectId: "",
        quoteId: "",
        paymentTermsType: "full_upfront",
        depositPercentage: "100",
        paymentTermsNote: "",
      }));
      setSubscriptionForm((current) => ({ ...current, projectId: "" }));
      return;
    }

    const project = projects.find((item) => String(item.id) === projectId);
    if (!project) {
      return;
    }

    const clientId = String(project.clientId);
    const projectClient = clients.find((item) => item.id === project.clientId);
    const defaultTerms = getDefaultPaymentTerms(project);

    setWorkspaceClientId(clientId);
    setWorkspaceProjectId(projectId);
    setWorkspaceQuoteId("");
    setProjectForm((current) => ({ ...current, clientId }));
    setQuoteForm((current) => ({
      ...current,
      clientId,
      projectId,
      title: getProjectQuoteTitle(project),
      scope: getProjectQuoteScope(project),
      currency: current.currency === "ZAR" ? project.currency : current.currency,
      recipientEmail: projectClient?.primaryContactEmail || current.recipientEmail,
      subtotal: getProjectQuoteSubtotal(project),
      paymentTermsType: defaultTerms.paymentTermsType,
      depositPercentage: defaultTerms.depositPercentage,
      paymentTermsNote: defaultTerms.paymentTermsNote,
    }));
    setInvoiceForm((current) => ({
      ...current,
      clientId,
      projectId,
      quoteId: "",
      currency: current.currency === "ZAR" ? project.currency : current.currency,
      subtotal: getProjectQuoteSubtotal(project),
      paymentTermsType: defaultTerms.paymentTermsType,
      depositPercentage: defaultTerms.depositPercentage,
      paymentTermsNote: defaultTerms.paymentTermsNote,
    }));
    setSubscriptionForm((current) => ({
      ...current,
      clientId,
      projectId,
      name: current.name || `${project.name} Retainer`,
      currency: current.currency === "ZAR" ? project.currency : current.currency,
      amount: current.amount || project.monthlyRetainerAmount || "",
    }));
  }

  function applyQuoteWorkspace(quoteId: string) {
    if (!quoteId) {
      setWorkspaceQuoteId("");
      setInvoiceForm((current) => ({ ...current, quoteId: "" }));
      return;
    }

    const quote = quotes.find((item) => String(item.id) === quoteId);
    if (!quote) {
      return;
    }

    const clientId = String(quote.clientId);
    const projectId = quote.projectId ? String(quote.projectId) : "";

    setWorkspaceClientId(clientId);
    setWorkspaceProjectId(projectId);
    setWorkspaceQuoteId(quoteId);
    setProjectForm((current) => ({ ...current, clientId }));
    setQuoteForm((current) => ({
      ...current,
      clientId,
      projectId,
      title: quote.title,
      scope: quote.scope || current.scope,
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      paymentTermsType: quote.paymentTermsType,
      depositPercentage: quote.depositPercentage != null ? String(quote.depositPercentage) : "",
      paymentTermsNote: quote.paymentTermsNote || "",
    }));
    setInvoiceForm((current) => ({
      ...current,
      clientId,
      projectId,
      quoteId,
      currency: current.currency === "ZAR" ? quote.currency : current.currency,
      subtotal: current.subtotal || quote.subtotal,
      taxAmount: current.taxAmount === "0" ? quote.taxAmount : current.taxAmount,
      paymentTermsType: quote.paymentTermsType,
      depositPercentage: quote.depositPercentage != null ? String(quote.depositPercentage) : "",
      paymentTermsNote: quote.paymentTermsNote || "",
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await loginMutation.mutateAsync({ email, password });
      toast({
        title: "Admin access granted",
        description: "The operations console is now unlocked.",
      });
    } catch (error) {
      toast({
        title: "Login failed",
        description: error instanceof Error ? error.message : "Unable to log in.",
        variant: "destructive",
      });
    }
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    toast({
      title: "Logged out",
      description: "Admin session closed.",
    });
  }

  async function handleCreateClient(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const client = await createClientMutation.mutateAsync({
        name: clientForm.name,
        primaryContactName: clientForm.primaryContactName || null,
        primaryContactEmail: clientForm.primaryContactEmail,
        primaryContactPhone: clientForm.primaryContactPhone || null,
        companyName: clientForm.companyName || null,
        status: clientForm.status,
        notes: clientForm.notes || null,
      });

      setClientForm({
        name: "",
        primaryContactName: "",
        primaryContactEmail: "",
        primaryContactPhone: "",
        companyName: "",
        status: "lead",
        notes: "",
      });
      applyClientWorkspace(String(client.id));

      toast({
        title: "Client created",
        description: `Client saved. The project, quote, invoice, and subscription flows are now focused on ${client.name}.`,
      });
    } catch (error) {
      toast({
        title: "Client creation failed",
        description: error instanceof Error ? error.message : "Unable to create client.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateClientFromInquiry(
    inquiry: NonNullable<typeof dashboardQuery.data>["recentInquiries"][number],
  ) {
    try {
      const client = await createClientMutation.mutateAsync({
        name: inquiry.name,
        primaryContactName: inquiry.name,
        primaryContactEmail: inquiry.email,
        primaryContactPhone: null,
        companyName: inquiry.company || null,
        status: "lead",
        notes: [inquiry.role ? `Role: ${inquiry.role}` : null, inquiry.message]
          .filter(Boolean)
          .join("\n\n"),
      });

      applyClientWorkspace(String(client.id));
      toast({
        title: "Client created from inquiry",
        description: `${client.name} is now active in the workflow and ready for project setup.`,
      });
    } catch (error) {
      toast({
        title: "Inquiry conversion failed",
        description:
          error instanceof Error ? error.message : "Unable to create client from inquiry.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const project = await createProjectMutation.mutateAsync({
        clientId: Number(projectForm.clientId),
        name: projectForm.name,
        description: projectForm.description || null,
        billingModel: projectForm.billingModel,
        currency: projectForm.currency,
        oneOffAmount:
          projectForm.billingModel !== "retainer" && projectForm.oneOffAmount
            ? Number(projectForm.oneOffAmount)
            : null,
        monthlyRetainerAmount:
          projectForm.billingModel !== "one_off" && projectForm.monthlyRetainerAmount
            ? Number(projectForm.monthlyRetainerAmount)
            : null,
        estimatedRetainerMonths:
          projectForm.billingModel === "retainer"
            ? projectForm.estimatedRetainerMonths
              ? Number(projectForm.estimatedRetainerMonths)
              : null
            : null,
      });

      applyProjectWorkspace(String(project.id));

      setProjectForm({
        clientId: String(project.clientId),
        name: "",
        description: "",
        billingModel: project.billingModel,
        currency: project.currency,
        oneOffAmount: "",
        monthlyRetainerAmount: "",
        estimatedRetainerMonths: project.estimatedRetainerMonths
          ? String(project.estimatedRetainerMonths)
          : "6",
      });

      toast({
        title: "Project created",
        description: `Project saved. Quote, invoice, and subscription creation are now linked to ${project.name}.`,
      });
    } catch (error) {
      toast({
        title: "Project creation failed",
        description: error instanceof Error ? error.message : "Unable to create project.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateQuote(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const project = projects.find((item) => String(item.id) === quoteForm.projectId);
      if (!project) {
        throw new Error("Select a project before creating a quote.");
      }

      const quote = await createQuoteMutation.mutateAsync({
        clientId: project.clientId,
        projectId: project.id,
        title: quoteForm.title?.trim() || getProjectQuoteTitle(project),
        scope: quoteForm.scope?.trim() || getProjectQuoteScope(project),
        currency: project.currency,
        recipientEmail: quoteForm.recipientEmail?.trim() || undefined,
        subtotal: Number(quoteForm.subtotal || getProjectQuoteSubtotal(project) || "0"),
        taxAmount: Number(quoteForm.taxAmount || "0"),
        paymentTermsType: quoteForm.paymentTermsType,
        depositPercentage: quoteForm.depositPercentage
          ? Number(quoteForm.depositPercentage)
          : null,
        paymentTermsNote: quoteForm.paymentTermsNote?.trim() || null,
        expiresAt: quoteForm.expiresAt ? new Date(quoteForm.expiresAt) : null,
      });

      applyQuoteWorkspace(String(quote.id));
      const defaultTerms = getDefaultPaymentTerms(project);

      setQuoteForm({
        clientId: String(quote.clientId),
        projectId: quote.projectId ? String(quote.projectId) : "",
        title: getProjectQuoteTitle(project),
        scope: getProjectQuoteScope(project),
        currency: quote.currency,
        recipientEmail: "",
        subtotal: getProjectQuoteSubtotal(project),
        taxAmount: "0",
        paymentTermsType: defaultTerms.paymentTermsType,
        depositPercentage: defaultTerms.depositPercentage,
        paymentTermsNote: defaultTerms.paymentTermsNote,
        expiresAt: "",
      });

      toast({
        title: "Quote created",
        description: `Quote saved. Invoice creation is now primed for ${quote.quoteNumber}, and the approval link is available on the quote card.`,
      });
    } catch (error) {
      toast({
        title: "Quote creation failed",
        description: error instanceof Error ? error.message : "Unable to create quote.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateInvoice(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const invoice = await createInvoiceMutation.mutateAsync({
        clientId: Number(invoiceForm.clientId),
        projectId: invoiceForm.projectId ? Number(invoiceForm.projectId) : null,
        quoteId: invoiceForm.quoteId ? Number(invoiceForm.quoteId) : null,
        currency: invoiceForm.currency,
        subtotal: Number(invoiceForm.subtotal || "0"),
        taxAmount: Number(invoiceForm.taxAmount || "0"),
        paymentTermsType: invoiceForm.paymentTermsType,
        depositPercentage: invoiceForm.depositPercentage
          ? Number(invoiceForm.depositPercentage)
          : null,
        paymentTermsNote: invoiceForm.paymentTermsNote?.trim() || null,
        dueAt: invoiceForm.dueAt ? new Date(invoiceForm.dueAt) : null,
        createPaymentLink: invoiceForm.createPaymentLink,
      });

      const project = projects.find(
        (item) =>
          String(item.id) ===
          (invoice.projectId ? String(invoice.projectId) : invoiceForm.projectId),
      );
      const defaultTerms = getDefaultPaymentTerms(project ?? null);

      setInvoiceForm({
        clientId: String(invoice.clientId),
        projectId: invoice.projectId ? String(invoice.projectId) : "",
        quoteId: invoice.quoteId ? String(invoice.quoteId) : "",
        currency: invoice.currency,
        subtotal: "",
        taxAmount: "0",
        paymentTermsType: defaultTerms.paymentTermsType,
        depositPercentage: defaultTerms.depositPercentage,
        paymentTermsNote: defaultTerms.paymentTermsNote,
        dueAt: "",
        createPaymentLink: true,
      });

      toast({
        title: "Invoice created",
        description: `Invoice ${invoice.invoiceNumber} is live and still attached to the current workspace.`,
      });
    } catch (error) {
      toast({
        title: "Invoice creation failed",
        description: error instanceof Error ? error.message : "Unable to create invoice.",
        variant: "destructive",
      });
    }
  }

  async function handleConvertQuote(quoteId: number) {
    try {
      const result = await convertQuoteMutation.mutateAsync(quoteId);
      const clientId = String(result.project.clientId);
      const projectId = String(result.project.id);
      const resolvedQuoteId = String(result.invoice.quoteId ?? quoteId);

      setWorkspaceClientId(clientId);
      setWorkspaceProjectId(projectId);
      setWorkspaceQuoteId(resolvedQuoteId);
      setProjectForm((current) => ({ ...current, clientId }));
      setQuoteForm((current) => ({ ...current, clientId, projectId }));
      setInvoiceForm((current) => ({
        ...current,
        clientId: String(result.invoice.clientId),
        projectId: result.invoice.projectId ? String(result.invoice.projectId) : "",
        quoteId: result.invoice.quoteId ? String(result.invoice.quoteId) : "",
        currency: result.invoice.currency,
        subtotal: result.invoice.subtotal,
        taxAmount: result.invoice.taxAmount,
      }));
      setSubscriptionForm((current) => ({
        ...current,
        clientId,
        projectId,
        currency: current.currency === "ZAR" ? result.project.currency : current.currency,
        amount: current.amount || result.project.monthlyRetainerAmount || "",
        name: current.name || `${result.project.name} Retainer`,
      }));

      toast({
        title: "Quote converted",
        description: `Project ${result.project.name} and invoice ${result.invoice.invoiceNumber} were created.`,
      });
    } catch (error) {
      toast({
        title: "Quote conversion failed",
        description: error instanceof Error ? error.message : "Unable to convert quote.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateSubscription(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const subscription = await createSubscriptionMutation.mutateAsync({
        clientId: Number(subscriptionForm.clientId),
        projectId: subscriptionForm.projectId ? Number(subscriptionForm.projectId) : null,
        name: subscriptionForm.name,
        status: subscriptionForm.status,
        currency: subscriptionForm.currency,
        amount: subscriptionForm.amount,
        interval: subscriptionForm.interval,
        provider: "payfast",
        providerSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });

      setSubscriptionForm({
        clientId: String(subscription.clientId),
        projectId: subscription.projectId ? String(subscription.projectId) : "",
        name: "",
        status: "pending",
        currency: subscription.currency,
        amount: "",
        interval: "month",
      });

      toast({
        title: "Subscription created",
        description: `Subscription ${subscription.name} has been added inside the current client workflow.`,
      });
    } catch (error) {
      toast({
        title: "Subscription creation failed",
        description: error instanceof Error ? error.message : "Unable to create subscription.",
        variant: "destructive",
      });
    }
  }

  async function handleUpdateSubscription(
    subscriptionId: number,
    input: { status?: SubscriptionStatus; cancelAtPeriodEnd?: boolean },
  ) {
    try {
      await updateSubscriptionMutation.mutateAsync({ subscriptionId, input });
      toast({
        title: "Subscription updated",
        description: "Lifecycle state has been saved.",
      });
    } catch (error) {
      toast({
        title: "Subscription update failed",
        description: error instanceof Error ? error.message : "Unable to update subscription.",
        variant: "destructive",
      });
    }
  }

  if (sessionQuery.isLoading) {
    return (
      <div className="min-h-screen bg-background px-6 py-10 text-foreground md:px-12">
        <div className="mx-auto max-w-6xl">
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Loading admin console...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen overflow-hidden bg-background text-foreground">
        <main className="mx-auto grid min-h-screen max-w-7xl grid-cols-1 gap-10 px-6 py-8 md:px-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <section className="relative overflow-hidden rounded-[2rem] border border-border/40 bg-card px-8 py-14 md:px-12">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,188,130,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.06),transparent_28%)]" />
            <div className="relative max-w-2xl space-y-8">
              <Badge variant="outline" className="border-primary/30 text-primary">
                Relief Works Operations
              </Badge>
              <div className="space-y-5">
                <h1 className="font-display text-5xl leading-[1.05] text-primary md:text-7xl">
                  A client system that feels controlled, premium, and exact.
                </h1>
                <p className="max-w-xl text-lg leading-relaxed text-muted-foreground md:text-xl">
                  This is the command layer for Relief Works: clients, quotations, invoicing,
                  subscriptions, and project oversight from one place.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="bg-background/70">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl text-primary">
                      Quote to Cash
                    </CardTitle>
                    <CardDescription>
                      Approvals, invoices, payment links, and monthly retainers.
                    </CardDescription>
                  </CardHeader>
                </Card>
                <Card className="bg-background/70">
                  <CardHeader>
                    <CardTitle className="font-display text-2xl text-primary">
                      Client Clarity
                    </CardTitle>
                    <CardDescription>
                      Every active project tracked with visible progress and billing state.
                    </CardDescription>
                  </CardHeader>
                </Card>
              </div>
            </div>
          </section>

          <Card className="border-border/50 bg-card/90 backdrop-blur-sm">
            <CardHeader className="space-y-3">
              <Badge variant="outline" className="w-fit border-primary/20 text-primary">
                Admin Access
              </Badge>
              <CardTitle className="font-display text-3xl text-primary">
                Enter the operations console
              </CardTitle>
              <CardDescription>
                Use the admin credentials configured for Relief Works.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="admin-email">
                    Email
                  </label>
                  <Input
                    id="admin-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground" htmlFor="admin-password">
                    Password
                  </label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                  />
                </div>
                <Button className="w-full" size="lg" type="submit" disabled={loginMutation.isPending}>
                  {loginMutation.isPending ? "Unlocking..." : "Unlock Admin"}
                </Button>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Default development credentials are active until you replace them with
                  `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_NAME`, and `SESSION_SECRET`.
                </p>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <AdminWorkspace
      sessionName={session?.user?.name}
      sessionEmail={session?.user?.email}
      dashboard={dashboardQuery.data ?? undefined}
      dashboardLoading={dashboardQuery.isLoading}
      clients={clients}
      projects={projects}
      quotes={quotes}
      invoices={invoices}
      subscriptions={subscriptions}
      subscriptionEvents={subscriptionEvents}
      selectedClient={selectedClient}
      selectedProject={selectedProject}
      selectedQuote={selectedQuote}
      workspaceClientId={workspaceClientId}
      workspaceProjectId={workspaceProjectId}
      workspaceQuoteId={workspaceQuoteId}
      clientForm={clientForm}
      setClientForm={setClientForm}
      projectForm={projectForm}
      setProjectForm={setProjectForm}
      quoteForm={quoteForm}
      setQuoteForm={setQuoteForm}
      invoiceForm={invoiceForm}
      setInvoiceForm={setInvoiceForm}
      subscriptionForm={subscriptionForm}
      setSubscriptionForm={setSubscriptionForm}
      createClientPending={createClientMutation.isPending}
      createProjectPending={createProjectMutation.isPending}
      createQuotePending={createQuoteMutation.isPending}
      createInvoicePending={createInvoiceMutation.isPending}
      createSubscriptionPending={createSubscriptionMutation.isPending}
      convertQuotePending={convertQuoteMutation.isPending}
      updateSubscriptionPending={updateSubscriptionMutation.isPending}
      logoutPending={logoutMutation.isPending}
      onSubmitClient={handleCreateClient}
      onSubmitProject={handleCreateProject}
      onSubmitQuote={handleCreateQuote}
      onSubmitInvoice={handleCreateInvoice}
      onSubmitSubscription={handleCreateSubscription}
      onCreateClientFromInquiry={handleCreateClientFromInquiry}
      onConvertQuote={handleConvertQuote}
      onUpdateSubscription={handleUpdateSubscription}
      onLogout={handleLogout}
      onSelectClient={applyClientWorkspace}
      onSelectProject={applyProjectWorkspace}
      onSelectQuote={applyQuoteWorkspace}
      onCopyQuoteApprovalLink={handleCopyQuoteApprovalLink}
    />
  );
}
