import { useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import type { AdminProject, AdminQuote } from "@shared/routes";
import {
  useAdminClients,
  useAdminDashboardSummary,
  useAdminInvoices,
  useAdminLogin,
  useAdminLogout,
  useAdminProjects,
  useAdminQuotes,
  useAdminSubscriptionEvents,
  useAdminSubscriptions,
  useAdminSession,
  useCreateAdminClient,
  useCreateAdminInvoice,
  useCreateAdminProject,
  useCreateAdminQuote,
  useCreateAdminSubscription,
  useUpdateAdminSubscription,
  useConvertAdminQuote,
} from "@/hooks/use-admin";
import {
  type BillingModel,
  billingModelOptions,
  type ClientStatus,
  clientStatusOptions,
  type SubscriptionInterval,
  subscriptionIntervalOptions,
  type SubscriptionStatus,
  subscriptionStatusOptions,
  type SupportedCurrency,
  supportedCurrencyOptions,
} from "@shared/schema";
import {
  Activity,
  ArrowRightLeft,
  BriefcaseBusiness,
  CircleDollarSign,
  FileSignature,
  FileCheck2,
  FileText,
  LifeBuoy,
  LogOut,
  Mail,
  Receipt,
  Users,
} from "lucide-react";

const metricMeta = [
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: BriefcaseBusiness },
  { key: "quotes", label: "Quotes", icon: FileCheck2 },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "subscriptions", label: "Subscriptions", icon: LifeBuoy },
  { key: "inquiries", label: "Inquiries", icon: Activity },
] as const;

function formatLabel(value: string) {
  return value.replace(/_/g, " ");
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
    expiresAt: "",
  });
  const [invoiceForm, setInvoiceForm] = useState<{
    clientId: string;
    projectId: string;
    quoteId: string;
    currency: SupportedCurrency;
    subtotal: string;
    taxAmount: string;
    dueAt: string;
    createPaymentLink: boolean;
  }>({
    clientId: "",
    projectId: "",
    quoteId: "",
    currency: "ZAR",
    subtotal: "",
    taxAmount: "0",
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

  const selectedClient = clients.find((client) => String(client.id) === workspaceClientId) ?? null;
  const selectedProject = projects.find((project) => String(project.id) === workspaceProjectId) ?? null;
  const selectedQuote = quotes.find((quote) => String(quote.id) === workspaceQuoteId) ?? null;

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

    if (project.billingModel === "retainer" || project.billingModel === "hybrid") {
      const estimatedMonths = getProjectEstimatedMonths(project);
      const buildCopy = project.oneOffAmount ? ` Setup/build amount: ${project.currency} ${project.oneOffAmount}.` : "";
      if (project.billingModel === "hybrid") {
        return `${project.description || project.name}${buildCopy} Monthly maintenance: ${project.currency} ${project.monthlyRetainerAmount || "0.00"} per month until cancelled.`.trim();
      }

      const durationCopy = estimatedMonths ? ` Estimated term: ${estimatedMonths} month${estimatedMonths === 1 ? "" : "s"}.` : "";
      return `${project.description || project.name}${buildCopy} Monthly maintenance: ${project.currency} ${project.monthlyRetainerAmount || "0.00"} per month.${durationCopy}`.trim();
    }

    return project.description || project.name;
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

  const workspaceProjects = workspaceClientId
    ? projects.filter((project) => String(project.clientId) === workspaceClientId)
    : projects;
  const workspaceQuotes = quotes.filter((quote) => {
    if (workspaceClientId && String(quote.clientId) !== workspaceClientId) {
      return false;
    }
    if (workspaceProjectId && String(quote.projectId ?? "") !== workspaceProjectId) {
      return false;
    }
    return true;
  });

  const quoteProjects = quoteForm.clientId
    ? projects.filter((project) => String(project.clientId) === quoteForm.clientId)
    : workspaceProjects;
  const invoiceProjects = invoiceForm.clientId
    ? projects.filter((project) => String(project.clientId) === invoiceForm.clientId)
    : workspaceProjects;
  const invoiceQuotes = quotes.filter((quote) => {
    if (invoiceForm.clientId && String(quote.clientId) !== invoiceForm.clientId) {
      return false;
    }
    if (invoiceForm.projectId && String(quote.projectId ?? "") !== invoiceForm.projectId) {
      return false;
    }
    return true;
  });
  const subscriptionProjects = subscriptionForm.clientId
    ? projects.filter((project) => String(project.clientId) === subscriptionForm.clientId)
    : workspaceProjects;
  const workspaceInvoiceCount = invoices.filter((invoice) => {
    if (!selectedClient) {
      return false;
    }
    if (invoice.clientId !== selectedClient.id) {
      return false;
    }
    if (selectedProject && invoice.projectId !== selectedProject.id) {
      return false;
    }
    return true;
  }).length;
  const nextWorkspaceAction = !selectedClient
    ? "Start by creating or selecting a client. Everything downstream will follow that context."
    : !selectedProject
      ? "Capture the delivery record next so pricing, scope, and billing structure stay attached to the client."
      : !selectedQuote
        ? "Turn the project into a formal quote next so approval and invoice generation stay linked."
        : "The workflow is connected. Move into invoice creation or create a maintenance subscription from this same context.";

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
      recipientEmail: client?.primaryContactEmail || current.recipientEmail,
    }));
    setInvoiceForm((current) => ({ ...current, clientId, projectId: "", quoteId: "" }));
    setSubscriptionForm((current) => ({ ...current, clientId, projectId: "" }));
  }

  function applyProjectWorkspace(projectId: string) {
    if (!projectId) {
      setWorkspaceProjectId("");
      setWorkspaceQuoteId("");
      setQuoteForm((current) => ({ ...current, projectId: "", title: "", scope: "", subtotal: "" }));
      setInvoiceForm((current) => ({ ...current, projectId: "", quoteId: "" }));
      setSubscriptionForm((current) => ({ ...current, projectId: "" }));
      return;
    }

    const project = projects.find((item) => String(item.id) === projectId);
    if (!project) {
      return;
    }

    const clientId = String(project.clientId);
    const projectClient = clients.find((item) => item.id === project.clientId);

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
    }));
    setInvoiceForm((current) => ({
      ...current,
      clientId,
      projectId,
      quoteId: "",
      currency: current.currency === "ZAR" ? project.currency : current.currency,
      subtotal: getProjectQuoteSubtotal(project),
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
    }));
    setInvoiceForm((current) => ({
      ...current,
      clientId,
      projectId,
      quoteId,
      currency: current.currency === "ZAR" ? quote.currency : current.currency,
      subtotal: current.subtotal || quote.subtotal,
      taxAmount: current.taxAmount === "0" ? quote.taxAmount : current.taxAmount,
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

  async function handleCreateClientFromInquiry(inquiry: NonNullable<typeof dashboardQuery.data>["recentInquiries"][number]) {
    try {
      const client = await createClientMutation.mutateAsync({
        name: inquiry.name,
        primaryContactName: inquiry.name,
        primaryContactEmail: inquiry.email,
        primaryContactPhone: null,
        companyName: inquiry.company || null,
        status: "lead",
        notes: [inquiry.role ? `Role: ${inquiry.role}` : null, inquiry.message].filter(Boolean).join("\n\n"),
      });

      applyClientWorkspace(String(client.id));
      toast({
        title: "Client created from inquiry",
        description: `${client.name} is now active in the workflow and ready for project setup.`,
      });
    } catch (error) {
      toast({
        title: "Inquiry conversion failed",
        description: error instanceof Error ? error.message : "Unable to create client from inquiry.",
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
        oneOffAmount: projectForm.billingModel !== "retainer" && projectForm.oneOffAmount
          ? Number(projectForm.oneOffAmount)
          : null,
        monthlyRetainerAmount: projectForm.billingModel !== "one_off" && projectForm.monthlyRetainerAmount
          ? Number(projectForm.monthlyRetainerAmount)
          : null,
        estimatedRetainerMonths: projectForm.billingModel === "retainer"
          ? (projectForm.estimatedRetainerMonths ? Number(projectForm.estimatedRetainerMonths) : null)
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
        estimatedRetainerMonths: project.estimatedRetainerMonths ? String(project.estimatedRetainerMonths) : "6",
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
        title: getProjectQuoteTitle(project),
        scope: getProjectQuoteScope(project),
        currency: project.currency,
        recipientEmail: quoteForm.recipientEmail?.trim() || undefined,
        subtotal: Number(getProjectQuoteSubtotal(project) || "0"),
        taxAmount: Number(quoteForm.taxAmount || "0"),
        expiresAt: quoteForm.expiresAt ? new Date(quoteForm.expiresAt) : null,
      });
      applyQuoteWorkspace(String(quote.id));

      setQuoteForm({
        clientId: String(quote.clientId),
        projectId: quote.projectId ? String(quote.projectId) : "",
        title: "",
        scope: "",
        currency: quote.currency,
        recipientEmail: "",
        subtotal: "",
        taxAmount: "0",
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
        dueAt: invoiceForm.dueAt ? new Date(invoiceForm.dueAt) : null,
        createPaymentLink: invoiceForm.createPaymentLink,
      });

      setInvoiceForm({
        clientId: String(invoice.clientId),
        projectId: invoice.projectId ? String(invoice.projectId) : "",
        quoteId: invoice.quoteId ? String(invoice.quoteId) : "",
        currency: invoice.currency,
        subtotal: "",
        taxAmount: "0",
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
      <div className="min-h-screen bg-background text-foreground px-6 py-10 md:px-12">
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
      <div className="min-h-screen bg-background text-foreground overflow-hidden">
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
                  This is the command layer for Relief Works: clients, quotations,
                  invoicing, subscriptions, and project oversight from one place.
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

  const summary = dashboardQuery.data;

  return (
    <div className="min-h-screen bg-background text-foreground px-6 py-8 md:px-12">
      <main className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 rounded-[2rem] border border-border/40 bg-card px-8 py-10 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Relief Works Admin
            </Badge>
            <h1 className="font-display text-4xl leading-tight text-primary md:text-6xl">
              The business now has a command center.
            </h1>
            <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
              This is the first operational layer: secure access, live totals, and the
              intake pulse feeding the future CRM, quotation, invoicing, and maintenance system.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-border/40 bg-background/70 p-5">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                Signed in as
              </p>
              <p className="mt-2 text-lg font-medium text-foreground">{session?.user?.name}</p>
              <p className="text-sm text-muted-foreground">{session?.user?.email}</p>
            </div>
            <Button variant="outline" onClick={handleLogout} disabled={logoutMutation.isPending}>
              <LogOut className="h-4 w-4" />
              {logoutMutation.isPending ? "Closing..." : "Log Out"}
            </Button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {metricMeta.map(({ key, label, icon: Icon }) => (
            <Card key={key} className="border-border/50 bg-card/80">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className="mt-3 font-display text-4xl text-primary">
                    {dashboardQuery.isLoading ? "--" : summary?.totals[key] ?? 0}
                  </CardTitle>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-primary">
                Incoming inquiries
              </CardTitle>
              <CardDescription>
                The current lead pulse before those records are converted into clients and projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {dashboardQuery.isLoading && (
                <p className="text-sm text-muted-foreground">Loading inquiry activity...</p>
              )}

              {!dashboardQuery.isLoading && summary?.recentInquiries.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No inquiries yet. The intake layer is active and waiting.
                </p>
              )}

              {summary?.recentInquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="rounded-2xl border border-border/50 bg-background/65 p-4"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium text-foreground">{inquiry.name}</h3>
                        <Badge variant="outline">{inquiry.pressureType}</Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                        <span className="inline-flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {inquiry.email}
                        </span>
                        {inquiry.company && <span>{inquiry.company}</span>}
                        {inquiry.role && <span>{inquiry.role}</span>}
                      </div>
                    </div>
                    <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {inquiry.createdAt
                        ? new Date(inquiry.createdAt).toLocaleDateString()
                        : "No date"}
                    </p>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {inquiry.message}
                  </p>
                  <div className="mt-4">
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      disabled={createClientMutation.isPending}
                      onClick={() => handleCreateClientFromInquiry(inquiry)}
                    >
                      Create Client From Inquiry
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-primary">
                Active workflow
              </CardTitle>
              <CardDescription>
                Keep one client context active so project, quote, invoice, and subscription work feels connected.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Client</p>
                  <div className="mt-3">
                    <Select value={workspaceClientId || "none"} onValueChange={(value) => applyClientWorkspace(value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client context" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No client selected</SelectItem>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={String(client.id)}>
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {selectedClient
                      ? `${selectedClient.name} is now the active account across the workflow.`
                      : "Choose a client once and downstream forms will inherit that context."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project</p>
                  <div className="mt-3">
                    <Select value={workspaceProjectId || "none"} onValueChange={(value) => applyProjectWorkspace(value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Focus a delivery record" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No project selected</SelectItem>
                        {workspaceProjects.map((project) => (
                          <SelectItem key={project.id} value={String(project.id)}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {selectedProject
                      ? `${selectedProject.name} is driving the quote, invoice, and subscription defaults below.`
                      : selectedClient
                        ? `${workspaceProjects.length} project records are available for ${selectedClient.name}.`
                        : "Select a client first to narrow the delivery records that matter."}
                  </p>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Quote</p>
                  <div className="mt-3">
                    <Select value={workspaceQuoteId || "none"} onValueChange={(value) => applyQuoteWorkspace(value === "none" ? "" : value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Focus a quote" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No quote selected</SelectItem>
                        {workspaceQuotes.map((quote) => (
                          <SelectItem key={quote.id} value={String(quote.id)}>
                            {quote.quoteNumber}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                    {selectedQuote
                      ? `${selectedQuote.quoteNumber} is active, so invoice creation can continue without re-entering the same links.`
                      : selectedProject
                        ? `${workspaceQuotes.length} quotes are tied to the current client and project context.`
                        : "Once a project is in focus, the relevant quotes stay attached here too."}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                <p className="text-sm font-medium text-foreground">Next recommended move</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{nextWorkspaceAction}</p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedClient}
                    onClick={() => setProjectForm((current) => ({ ...current, clientId: workspaceClientId }))}
                  >
                    Prepare project form
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedClient}
                    onClick={() =>
                      selectedProject
                        ? applyProjectWorkspace(String(selectedProject.id))
                        : setQuoteForm((current) => ({ ...current, clientId: workspaceClientId }))
                    }
                  >
                    Prepare quote form
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    disabled={!selectedClient}
                    onClick={() =>
                      selectedQuote
                        ? applyQuoteWorkspace(String(selectedQuote.id))
                        : selectedProject
                          ? applyProjectWorkspace(String(selectedProject.id))
                          : setInvoiceForm((current) => ({ ...current, clientId: workspaceClientId }))
                    }
                  >
                    Prepare invoice form
                  </Button>
                </div>
              </div>

              <div className="grid gap-3">
                {[
                  {
                    label: "1. Client captured",
                    complete: Boolean(selectedClient),
                    detail: selectedClient
                      ? `${selectedClient.name} is the active account.`
                      : "No active client yet.",
                  },
                  {
                    label: "2. Delivery record attached",
                    complete: Boolean(selectedProject),
                    detail: selectedProject
                      ? `${selectedProject.name} uses ${formatLabel(selectedProject.billingModel)} billing.`
                      : selectedClient
                        ? "Create or select the project next."
                        : "Client context unlocks this step.",
                  },
                  {
                    label: "3. Commercials connected",
                    complete: Boolean(selectedQuote),
                    detail: selectedQuote
                      ? `${selectedQuote.quoteNumber} is ready for approval and billing.`
                      : selectedProject
                        ? "Create the quote next so invoices stay connected."
                        : "Project context unlocks this step.",
                  },
                  {
                    label: "4. Cash collection ready",
                    complete: workspaceInvoiceCount > 0,
                    detail: workspaceInvoiceCount > 0
                      ? `${workspaceInvoiceCount} invoice record(s) already exist in the current workspace.`
                      : "No invoice has been created in this active workflow yet.",
                  },
                ].map((step) => (
                  <div key={step.label} className="rounded-2xl border border-border/50 bg-background/65 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-medium text-foreground">{step.label}</p>
                      <Badge variant={step.complete ? "secondary" : "outline"}>
                        {step.complete ? "Connected" : "Pending"}
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1fr]">
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-3xl text-primary">
                    Clients
                  </CardTitle>
                  <CardDescription>
                    Add and review the companies and contacts Relief Works manages.
                  </CardDescription>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateClient}>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Client name"
                    value={clientForm.name}
                    onChange={(event) => setClientForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <Input
                    placeholder="Company name"
                    value={clientForm.companyName}
                    onChange={(event) => setClientForm((current) => ({ ...current, companyName: event.target.value }))}
                  />
                  <Input
                    placeholder="Primary contact"
                    value={clientForm.primaryContactName}
                    onChange={(event) => setClientForm((current) => ({ ...current, primaryContactName: event.target.value }))}
                  />
                  <Input
                    placeholder="Primary email"
                    type="email"
                    value={clientForm.primaryContactEmail}
                    onChange={(event) => setClientForm((current) => ({ ...current, primaryContactEmail: event.target.value }))}
                  />
                  <Input
                    placeholder="Phone"
                    value={clientForm.primaryContactPhone}
                    onChange={(event) => setClientForm((current) => ({ ...current, primaryContactPhone: event.target.value }))}
                  />
                  <Select value={clientForm.status} onValueChange={(value) => setClientForm((current) => ({ ...current, status: value as ClientStatus }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Client status" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Operational notes, billing context, or delivery details"
                  value={clientForm.notes}
                  onChange={(event) => setClientForm((current) => ({ ...current, notes: event.target.value }))}
                />
                <Button type="submit" disabled={createClientMutation.isPending}>
                  {createClientMutation.isPending ? "Creating client..." : "Create Client"}
                </Button>
              </form>

              <div className="space-y-3">
                {clientsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading clients...</p>}
                {!clientsQuery.isLoading && clientsQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No clients yet. Add the first one above.</p>
                )}
                {clientsQuery.data?.map((client) => (
                  <div
                    key={client.id}
                    className={`rounded-2xl border p-4 ${
                      selectedClient?.id === client.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-background/65"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{client.name}</h3>
                          <Badge variant="outline">{client.status}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {client.companyName || "No company specified"}
                        </p>
                        <p className="mt-3 text-sm text-muted-foreground">
                          {client.primaryContactName || client.primaryContactEmail}
                        </p>
                        <p className="text-sm text-muted-foreground">{client.primaryContactEmail}</p>
                      </div>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedClient?.id === client.id ? "secondary" : "outline"}
                        onClick={() => applyClientWorkspace(String(client.id))}
                      >
                        {selectedClient?.id === client.id ? "In workflow" : "Focus"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-3xl text-primary">
                    Projects
                  </CardTitle>
                  <CardDescription>
                    Create the delivery record once. Lifecycle status will be inferred automatically from quotes and invoices.
                  </CardDescription>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedClient
                      ? `Currently working inside ${selectedClient.name}. New projects will carry that client context forward.`
                      : "Choose or create a client first so the rest of the delivery flow stays attached."}
                  </p>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateProject}>
                <Select value={projectForm.clientId} onValueChange={(value) => applyClientWorkspace(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={String(client.id)}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="grid gap-4 md:grid-cols-2">
                  <Input
                    placeholder="Project name"
                    value={projectForm.name}
                    onChange={(event) => setProjectForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <Select value={projectForm.billingModel} onValueChange={(value) => setProjectForm((current) => ({ ...current, billingModel: value as BillingModel }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Billing model" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingModelOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {formatLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={projectForm.currency} onValueChange={(value) => setProjectForm((current) => ({ ...current, currency: value as SupportedCurrency }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {projectForm.billingModel !== "retainer" && (
                    <Input
                      placeholder={projectForm.billingModel === "hybrid" ? "Setup amount" : "Build amount"}
                      value={projectForm.oneOffAmount}
                      onChange={(event) => setProjectForm((current) => ({ ...current, oneOffAmount: event.target.value }))}
                    />
                  )}
                  {projectForm.billingModel !== "one_off" && (
                    <Input
                      placeholder="Monthly maintenance amount"
                      value={projectForm.monthlyRetainerAmount}
                      onChange={(event) => setProjectForm((current) => ({ ...current, monthlyRetainerAmount: event.target.value }))}
                    />
                  )}
                  {projectForm.billingModel === "retainer" && (
                    <Input
                      placeholder="Estimated months"
                      value={projectForm.estimatedRetainerMonths}
                      onChange={(event) => setProjectForm((current) => ({ ...current, estimatedRetainerMonths: event.target.value }))}
                    />
                  )}
                </div>
                <Textarea
                  placeholder="Project scope and delivery framing"
                  value={projectForm.description}
                  onChange={(event) => setProjectForm((current) => ({ ...current, description: event.target.value }))}
                />
                <Button
                  type="submit"
                  disabled={createProjectMutation.isPending || !clientsQuery.data?.length}
                >
                  {createProjectMutation.isPending ? "Creating project..." : "Create Project"}
                </Button>
              </form>

              <div className="space-y-3">
                {projectsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading projects...</p>}
                {!projectsQuery.isLoading && projectsQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No projects yet. Create a client first, then add the project here.
                  </p>
                )}
                {projectsQuery.data?.map((project) => (
                  <div
                    key={project.id}
                    className={`rounded-2xl border p-4 ${
                      selectedProject?.id === project.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-background/65"
                    }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
                          <Badge variant="outline">{project.lifecycleStatus}</Badge>
                          <Badge variant="secondary">{formatLabel(project.billingModel)}</Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">{project.clientName}</p>
                      </div>
                      <div className="rounded-full border border-border/50 bg-background/75 px-3 py-1.5 text-sm text-primary">
                        <span className="inline-flex items-center gap-2">
                          <CircleDollarSign className="h-4 w-4" />
                          {project.currency}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedProject?.id === project.id ? "secondary" : "outline"}
                        onClick={() => applyProjectWorkspace(String(project.id))}
                      >
                        {selectedProject?.id === project.id ? "In workflow" : "Focus"}
                      </Button>
                    </div>
                    {(project.oneOffAmount || project.monthlyRetainerAmount) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {project.oneOffAmount && <span>Build: {project.oneOffAmount}</span>}
                        {project.monthlyRetainerAmount && <span>Maintenance: {project.monthlyRetainerAmount}</span>}
                        {project.estimatedRetainerMonths && <span>Estimated months: {project.estimatedRetainerMonths}</span>}
                      </div>
                    )}
                    {project.description && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {project.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-3 rounded-2xl border border-border/50 bg-background/65 p-4">
                <p className="text-sm font-medium text-foreground">Lifecycle timeline</p>
                {subscriptionEventsQuery.isLoading && (
                  <p className="text-sm text-muted-foreground">Loading lifecycle events...</p>
                )}
                {!subscriptionEventsQuery.isLoading && subscriptionEventsQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">No lifecycle events yet.</p>
                )}
                {subscriptionEventsQuery.data?.slice(0, 8).map((event) => (
                  <div key={event.id} className="rounded-xl border border-border/50 bg-card/70 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{event.subscriptionName} / {event.clientName}</p>
                      <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.fromStatus ? `${event.fromStatus} -> ${event.toStatus}` : `Set to ${event.toStatus}`} via {event.source}
                    </p>
                    {event.note && <p className="mt-1 text-xs text-muted-foreground">{event.note}</p>}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-3xl text-primary">
                    Quotations
                  </CardTitle>
                  <CardDescription>
                    Create a quote from the linked project. Scope, pricing, and client context are inherited automatically.
                  </CardDescription>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedProject
                      ? `Quote defaults are anchored to ${selectedProject.name}.`
                      : selectedClient
                        ? `Quotes will stay attached to ${selectedClient.name} once you choose a project or create one.`
                        : "Pick a client context to stop reselecting the same account in every commercial step."}
                  </p>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <FileSignature className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateQuote}>
                <div className="grid gap-4 lg:grid-cols-[1fr_0.8fr]">
                  <Select value={quoteForm.projectId || "none"} onValueChange={(value) => applyProjectWorkspace(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Select project</SelectItem>
                      {quoteProjects.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                  <p className="text-sm font-medium text-foreground">Quote source</p>
                  {selectedProject ? (
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="text-foreground">Client:</span> {selectedProject.clientName}</p>
                      <p><span className="text-foreground">Title:</span> {getProjectQuoteTitle(selectedProject)}</p>
                      <p><span className="text-foreground">Billing:</span> {formatLabel(selectedProject.billingModel)}</p>
                      {selectedProject.billingModel === "retainer" && (
                        <p>
                          <span className="text-foreground">Retainer math:</span> {selectedProject.currency} {selectedProject.monthlyRetainerAmount || "0.00"} x {selectedProject.estimatedRetainerMonths || 1} month{selectedProject.estimatedRetainerMonths === 1 ? "" : "s"}
                        </p>
                      )}
                      {selectedProject.billingModel === "hybrid" && selectedProject.oneOffAmount && (
                        <p><span className="text-foreground">Setup/build:</span> {selectedProject.currency} {selectedProject.oneOffAmount}</p>
                      )}
                      {selectedProject.billingModel === "hybrid" && (
                        <p><span className="text-foreground">Maintenance:</span> {selectedProject.currency} {selectedProject.monthlyRetainerAmount || "0.00"} per month until cancelled</p>
                      )}
                      <p><span className="text-foreground">Scope:</span> {getProjectQuoteScope(selectedProject)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      Pick a project and the quote will pull through the client, scope, currency, and pricing automatically.
                    </p>
                  )}
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    placeholder="Recipient email"
                    type="email"
                    value={quoteForm.recipientEmail}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, recipientEmail: event.target.value }))}
                  />
                  <Input
                    placeholder="Currency"
                    value={selectedProject?.currency || quoteForm.currency}
                    disabled
                  />
                  <Input
                    placeholder="Subtotal"
                    value={selectedProject ? getProjectQuoteSubtotal(selectedProject) : quoteForm.subtotal}
                    disabled
                  />
                  <Input
                    placeholder="Tax"
                    value={quoteForm.taxAmount}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, taxAmount: event.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="Expiry"
                    value={quoteForm.expiresAt}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, expiresAt: event.target.value }))}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={createQuoteMutation.isPending || !quoteForm.projectId}
                >
                  {createQuoteMutation.isPending ? "Creating quote..." : "Create Quote"}
                </Button>
              </form>

              <div className="space-y-3">
                {quotesQuery.isLoading && <p className="text-sm text-muted-foreground">Loading quotes...</p>}
                {!quotesQuery.isLoading && quotesQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No quotations yet. Create the first one above.
                  </p>
                )}
                {quotesQuery.data?.map((quote) => (
                  <div
                    key={quote.id}
                    className={`rounded-2xl border p-4 ${
                      selectedQuote?.id === quote.id
                        ? "border-primary/50 bg-primary/5"
                        : "border-border/50 bg-background/65"
                    }`}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{quote.title}</h3>
                          <Badge variant="outline">{quote.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{quote.quoteNumber}</p>
                        <p className="text-sm text-muted-foreground">{quote.clientName}{quote.projectName ? ` / ${quote.projectName}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-primary">
                          {quote.currency} {quote.totalAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subtotal {quote.subtotal} / Tax {quote.taxAmount}
                        </p>
                      </div>
                    </div>
                    {quote.scope && (
                      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                        {quote.scope}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-3 text-xs uppercase tracking-[0.14em] text-muted-foreground">
                      {quote.expiresAt && <span>Expires {new Date(quote.expiresAt).toLocaleDateString()}</span>}
                      {quote.approvalToken && <span>Approval token ready</span>}
                    </div>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        size="sm"
                        variant={selectedQuote?.id === quote.id ? "secondary" : "outline"}
                        onClick={() => applyQuoteWorkspace(String(quote.id))}
                        type="button"
                      >
                        {selectedQuote?.id === quote.id ? "In workflow" : "Focus"}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={quote.status !== "approved" || convertQuoteMutation.isPending}
                        onClick={() => handleConvertQuote(quote.id)}
                        type="button"
                      >
                        Convert to Project + Invoice
                      </Button>
                      {quote.approvalToken && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => void handleCopyQuoteApprovalLink(quote)}
                          type="button"
                        >
                          Copy Approval Link
                        </Button>
                      )}
                      {quote.approvalToken && getQuoteApprovalHref(quote) && (
                        <a
                          className="inline-flex items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                          href={getQuoteApprovalHref(quote) ?? "#"}
                          rel="noreferrer"
                          target="_blank"
                        >
                          Open Approval Page
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-3xl text-primary">
                    Invoices
                  </CardTitle>
                  <CardDescription>
                    Create invoices and generate PayFast payment links that clients can pay directly.
                  </CardDescription>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedQuote
                      ? `Invoice creation is preloaded from ${selectedQuote.quoteNumber}.`
                      : selectedProject
                        ? `Invoices can stay tied to ${selectedProject.name} without re-entering the client link.`
                        : "Invoice creation becomes much faster once a project or quote is already active in the workspace."}
                  </p>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateInvoice}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Select value={invoiceForm.clientId} onValueChange={(value) => applyClientWorkspace(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={invoiceForm.projectId || "none"} onValueChange={(value) => applyProjectWorkspace(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked project</SelectItem>
                      {invoiceProjects.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={invoiceForm.quoteId || "none"} onValueChange={(value) => applyQuoteWorkspace(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional quote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked quote</SelectItem>
                      {invoiceQuotes.map((quote) => (
                        <SelectItem key={quote.id} value={String(quote.id)}>
                          {quote.quoteNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Select value={invoiceForm.currency} onValueChange={(value) => setInvoiceForm((current) => ({ ...current, currency: value as SupportedCurrency }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Subtotal"
                    value={invoiceForm.subtotal}
                    onChange={(event) => setInvoiceForm((current) => ({ ...current, subtotal: event.target.value }))}
                  />
                  <Input
                    placeholder="Tax"
                    value={invoiceForm.taxAmount}
                    onChange={(event) => setInvoiceForm((current) => ({ ...current, taxAmount: event.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="Due date"
                    value={invoiceForm.dueAt}
                    onChange={(event) => setInvoiceForm((current) => ({ ...current, dueAt: event.target.value }))}
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={invoiceForm.createPaymentLink}
                    onChange={(event) =>
                      setInvoiceForm((current) => ({ ...current, createPaymentLink: event.target.checked }))
                    }
                  />
                  Generate PayFast payment link immediately
                </label>

                <Button
                  type="submit"
                  disabled={createInvoiceMutation.isPending || !clientsQuery.data?.length}
                >
                  {createInvoiceMutation.isPending ? "Creating invoice..." : "Create Invoice"}
                </Button>
              </form>

              <div className="space-y-3">
                {invoicesQuery.isLoading && <p className="text-sm text-muted-foreground">Loading invoices...</p>}
                {!invoicesQuery.isLoading && invoicesQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No invoices yet. Create the first invoice above.
                  </p>
                )}
                {invoicesQuery.data?.map((invoice) => (
                  <div key={invoice.id} className="rounded-2xl border border-border/50 bg-background/65 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{invoice.invoiceNumber}</h3>
                          <Badge variant="outline">{invoice.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                        <p className="text-sm text-muted-foreground">{invoice.clientEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-primary">
                          {invoice.currency} {invoice.totalAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Due {invoice.balanceDue} / Paid {invoice.amountPaid}
                        </p>
                      </div>
                    </div>
                    {invoice.paymentLink && (
                      <a
                        className="mt-3 inline-flex text-sm text-primary underline underline-offset-2"
                        href={invoice.paymentLink}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open payment link
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section>
          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="font-display text-3xl text-primary">
                    Subscriptions
                  </CardTitle>
                  <CardDescription>
                    Track recurring maintenance retainers and monthly billing state.
                  </CardDescription>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {selectedProject
                      ? `Retainer setup can inherit the active project ${selectedProject.name}.`
                      : selectedClient
                        ? `Select a project when relevant, but the client context is already locked to ${selectedClient.name}.`
                        : "Maintenance subscriptions work best once the client and project context is already established above."}
                  </p>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <LifeBuoy className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateSubscription}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Select value={subscriptionForm.clientId} onValueChange={(value) => applyClientWorkspace(value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={subscriptionForm.projectId || "none"} onValueChange={(value) => applyProjectWorkspace(value === "none" ? "" : value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked project</SelectItem>
                      {subscriptionProjects.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Subscription name"
                    value={subscriptionForm.name}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, name: event.target.value }))}
                  />
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Select value={subscriptionForm.status} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, status: value as SubscriptionStatus }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {formatLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={subscriptionForm.currency} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, currency: value as SupportedCurrency }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Currency" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedCurrencyOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Amount"
                    value={subscriptionForm.amount}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, amount: event.target.value }))}
                  />

                  <Select value={subscriptionForm.interval} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, interval: value as SubscriptionInterval }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionIntervalOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {formatLabel(option)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  type="submit"
                  disabled={createSubscriptionMutation.isPending || !clientsQuery.data?.length}
                >
                  {createSubscriptionMutation.isPending ? "Creating subscription..." : "Create Subscription"}
                </Button>
              </form>

              <div className="space-y-3">
                {subscriptionsQuery.isLoading && <p className="text-sm text-muted-foreground">Loading subscriptions...</p>}
                {!subscriptionsQuery.isLoading && subscriptionsQuery.data?.length === 0 && (
                  <p className="text-sm text-muted-foreground">
                    No subscriptions yet. Create the first recurring retainer above.
                  </p>
                )}
                {subscriptionsQuery.data?.map((subscription) => (
                  <div key={subscription.id} className="rounded-2xl border border-border/50 bg-background/65 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{subscription.name}</h3>
                          <Badge variant="outline">{subscription.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{subscription.clientName}{subscription.projectName ? ` / ${subscription.projectName}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-primary">
                          {subscription.currency} {subscription.amount}
                        </p>
                        <p className="text-sm text-muted-foreground">Every {subscription.interval}</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={updateSubscriptionMutation.isPending || subscription.status === "active"}
                        onClick={() => handleUpdateSubscription(subscription.id, { status: "active", cancelAtPeriodEnd: false })}
                      >
                        Activate
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        disabled={updateSubscriptionMutation.isPending || subscription.status === "paused"}
                        onClick={() => handleUpdateSubscription(subscription.id, { status: "paused" })}
                      >
                        Pause
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateSubscriptionMutation.isPending || subscription.cancelAtPeriodEnd}
                        onClick={() => handleUpdateSubscription(subscription.id, { cancelAtPeriodEnd: true })}
                      >
                        Cancel At Period End
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        disabled={updateSubscriptionMutation.isPending || !subscription.cancelAtPeriodEnd}
                        onClick={() => handleUpdateSubscription(subscription.id, { cancelAtPeriodEnd: false })}
                      >
                        Reactivate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
