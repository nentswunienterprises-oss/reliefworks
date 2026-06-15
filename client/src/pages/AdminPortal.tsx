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

const clientStatusOptions = ["lead", "active", "paused", "archived"];
const projectStatusOptions = ["lead", "quoted", "active", "maintenance", "completed"];
const billingModelOptions = ["one_off", "retainer", "hybrid"];
const subscriptionStatusOptions = ["pending", "active", "paused", "cancelled"];
const subscriptionIntervalOptions = ["month", "year"];

const metricMeta = [
  { key: "clients", label: "Clients", icon: Users },
  { key: "projects", label: "Projects", icon: BriefcaseBusiness },
  { key: "quotes", label: "Quotes", icon: FileCheck2 },
  { key: "invoices", label: "Invoices", icon: FileText },
  { key: "subscriptions", label: "Subscriptions", icon: LifeBuoy },
  { key: "inquiries", label: "Inquiries", icon: Activity },
] as const;

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
  const [clientForm, setClientForm] = useState({
    name: "",
    primaryContactName: "",
    primaryContactEmail: "",
    primaryContactPhone: "",
    companyName: "",
    status: "lead",
    notes: "",
  });
  const [projectForm, setProjectForm] = useState({
    clientId: "",
    name: "",
    description: "",
    status: "lead",
    billingModel: "hybrid",
    currency: "ZAR",
    oneOffAmount: "",
    monthlyRetainerAmount: "",
  });
  const [quoteForm, setQuoteForm] = useState({
    clientId: "",
    projectId: "",
    title: "",
    scope: "",
    currency: "ZAR",
    subtotal: "",
    taxAmount: "0",
    expiresAt: "",
  });
  const [invoiceForm, setInvoiceForm] = useState({
    clientId: "",
    projectId: "",
    quoteId: "",
    currency: "ZAR",
    subtotal: "",
    taxAmount: "0",
    dueAt: "",
    createPaymentLink: true,
  });
  const [subscriptionForm, setSubscriptionForm] = useState({
    clientId: "",
    projectId: "",
    name: "",
    status: "pending",
    currency: "ZAR",
    amount: "",
    interval: "month",
  });

  const session = sessionQuery.data;
  const isAuthenticated = Boolean(session?.isAuthenticated);
  const dashboardQuery = useAdminDashboardSummary(isAuthenticated);
  const clientsQuery = useAdminClients(isAuthenticated);
  const projectsQuery = useAdminProjects(isAuthenticated);
  const quotesQuery = useAdminQuotes(isAuthenticated);
  const invoicesQuery = useAdminInvoices(isAuthenticated);
  const subscriptionsQuery = useAdminSubscriptions(isAuthenticated);
  const subscriptionEventsQuery = useAdminSubscriptionEvents(isAuthenticated);

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
      await createClientMutation.mutateAsync({
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

      toast({
        title: "Client created",
        description: "The client is now part of the Relief Works system.",
      });
    } catch (error) {
      toast({
        title: "Client creation failed",
        description: error instanceof Error ? error.message : "Unable to create client.",
        variant: "destructive",
      });
    }
  }

  async function handleCreateProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      await createProjectMutation.mutateAsync({
        clientId: Number(projectForm.clientId),
        name: projectForm.name,
        description: projectForm.description || null,
        status: projectForm.status,
        billingModel: projectForm.billingModel,
        currency: projectForm.currency,
        oneOffAmount: projectForm.oneOffAmount || null,
        monthlyRetainerAmount: projectForm.monthlyRetainerAmount || null,
        startDate: null,
        endDate: null,
      });

      setProjectForm({
        clientId: "",
        name: "",
        description: "",
        status: "lead",
        billingModel: "hybrid",
        currency: "ZAR",
        oneOffAmount: "",
        monthlyRetainerAmount: "",
      });

      toast({
        title: "Project created",
        description: "The project now exists in the operations console.",
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
      await createQuoteMutation.mutateAsync({
        clientId: Number(quoteForm.clientId),
        projectId: quoteForm.projectId ? Number(quoteForm.projectId) : null,
        title: quoteForm.title,
        scope: quoteForm.scope || null,
        currency: quoteForm.currency.toUpperCase(),
        subtotal: Number(quoteForm.subtotal || "0"),
        taxAmount: Number(quoteForm.taxAmount || "0"),
        expiresAt: quoteForm.expiresAt ? new Date(quoteForm.expiresAt) : null,
      });

      setQuoteForm({
        clientId: "",
        projectId: "",
        title: "",
        scope: "",
        currency: "ZAR",
        subtotal: "",
        taxAmount: "0",
        expiresAt: "",
      });

      toast({
        title: "Quote created",
        description: "The quotation is now in draft and ready for send/approval flow.",
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
      await createInvoiceMutation.mutateAsync({
        clientId: Number(invoiceForm.clientId),
        projectId: invoiceForm.projectId ? Number(invoiceForm.projectId) : null,
        quoteId: invoiceForm.quoteId ? Number(invoiceForm.quoteId) : null,
        currency: invoiceForm.currency.toUpperCase(),
        subtotal: Number(invoiceForm.subtotal || "0"),
        taxAmount: Number(invoiceForm.taxAmount || "0"),
        dueAt: invoiceForm.dueAt ? new Date(invoiceForm.dueAt) : null,
        createPaymentLink: invoiceForm.createPaymentLink,
      });

      setInvoiceForm({
        clientId: "",
        projectId: "",
        quoteId: "",
        currency: "ZAR",
        subtotal: "",
        taxAmount: "0",
        dueAt: "",
        createPaymentLink: true,
      });

      toast({
        title: "Invoice created",
        description: "Invoice saved and PayFast link generated when enabled.",
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
      await createSubscriptionMutation.mutateAsync({
        clientId: Number(subscriptionForm.clientId),
        projectId: subscriptionForm.projectId ? Number(subscriptionForm.projectId) : null,
        name: subscriptionForm.name,
        status: subscriptionForm.status,
        currency: subscriptionForm.currency.toUpperCase(),
        amount: subscriptionForm.amount,
        interval: subscriptionForm.interval,
        provider: "payfast",
        providerSubscriptionId: null,
        currentPeriodStart: null,
        currentPeriodEnd: null,
        cancelAtPeriodEnd: false,
      });

      setSubscriptionForm({
        clientId: "",
        projectId: "",
        name: "",
        status: "pending",
        currency: "ZAR",
        amount: "",
        interval: "month",
      });

      toast({
        title: "Subscription created",
        description: "Recurring maintenance record has been added.",
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
    input: { status?: string; cancelAtPeriodEnd?: boolean },
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
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/85">
            <CardHeader>
              <CardTitle className="font-display text-3xl text-primary">
                What comes next
              </CardTitle>
              <CardDescription>
                The next implementation slice should convert this shell into a working operating system.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm leading-relaxed text-muted-foreground">
              <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                <p className="font-medium text-foreground">Client and project CRUD</p>
                <p className="mt-2">
                  Create, edit, and move clients and projects through lead, quoted, active, and maintenance states.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                <p className="font-medium text-foreground">Quote and invoice generation</p>
                <p className="mt-2">
                  Turn approved proposals into one-off build invoices and recurring maintenance subscriptions.
                </p>
              </div>
              <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                <p className="font-medium text-foreground">PayFast and email delivery</p>
                <p className="mt-2">
                  Attach hosted payment links, send branded emails, and sync payment status back into the portal.
                </p>
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
                  <Select value={clientForm.status} onValueChange={(value) => setClientForm((current) => ({ ...current, status: value }))}>
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
                  <div key={client.id} className="rounded-2xl border border-border/50 bg-background/65 p-4">
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
                    Create active delivery records with billing structure and status.
                  </CardDescription>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <ArrowRightLeft className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateProject}>
                <Select value={projectForm.clientId} onValueChange={(value) => setProjectForm((current) => ({ ...current, clientId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client" />
                  </SelectTrigger>
                  <SelectContent>
                    {clientsQuery.data?.map((client) => (
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
                  <Select value={projectForm.status} onValueChange={(value) => setProjectForm((current) => ({ ...current, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Project status" />
                    </SelectTrigger>
                    <SelectContent>
                      {projectStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={projectForm.billingModel} onValueChange={(value) => setProjectForm((current) => ({ ...current, billingModel: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Billing model" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingModelOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Currency"
                    value={projectForm.currency}
                    onChange={(event) => setProjectForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                  />
                  <Input
                    placeholder="One-off amount"
                    value={projectForm.oneOffAmount}
                    onChange={(event) => setProjectForm((current) => ({ ...current, oneOffAmount: event.target.value }))}
                  />
                  <Input
                    placeholder="Monthly retainer"
                    value={projectForm.monthlyRetainerAmount}
                    onChange={(event) => setProjectForm((current) => ({ ...current, monthlyRetainerAmount: event.target.value }))}
                  />
                </div>
                <Textarea
                  placeholder="Project scope, delivery notes, or maintenance framing"
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
                  <div key={project.id} className="rounded-2xl border border-border/50 bg-background/65 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{project.name}</h3>
                          <Badge variant="outline">{project.status}</Badge>
                          <Badge variant="secondary">{project.billingModel}</Badge>
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
                    {(project.oneOffAmount || project.monthlyRetainerAmount) && (
                      <div className="mt-3 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {project.oneOffAmount && <span>Build: {project.oneOffAmount}</span>}
                        {project.monthlyRetainerAmount && <span>Maintenance: {project.monthlyRetainerAmount}</span>}
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
                      <p className="text-sm font-medium text-foreground">{event.subscriptionName} · {event.clientName}</p>
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
                    Build formal quotes with totals and expiry so clients can move into approval and billing.
                  </CardDescription>
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <FileSignature className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateQuote}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Select value={quoteForm.clientId} onValueChange={(value) => setQuoteForm((current) => ({ ...current, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsQuery.data?.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={quoteForm.projectId || "none"} onValueChange={(value) => setQuoteForm((current) => ({ ...current, projectId: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked project</SelectItem>
                      {projectsQuery.data?.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Quote title"
                    value={quoteForm.title}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, title: event.target.value }))}
                  />
                </div>

                <Textarea
                  placeholder="Scope and deliverables summary"
                  value={quoteForm.scope}
                  onChange={(event) => setQuoteForm((current) => ({ ...current, scope: event.target.value }))}
                />

                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    placeholder="Currency"
                    value={quoteForm.currency}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                  />
                  <Input
                    placeholder="Subtotal"
                    value={quoteForm.subtotal}
                    onChange={(event) => setQuoteForm((current) => ({ ...current, subtotal: event.target.value }))}
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
                  disabled={createQuoteMutation.isPending || !clientsQuery.data?.length}
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
                  <div key={quote.id} className="rounded-2xl border border-border/50 bg-background/65 p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-medium text-foreground">{quote.title}</h3>
                          <Badge variant="outline">{quote.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{quote.quoteNumber}</p>
                        <p className="text-sm text-muted-foreground">{quote.clientName}{quote.projectName ? ` · ${quote.projectName}` : ""}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-medium text-primary">
                          {quote.currency} {quote.totalAmount}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Subtotal {quote.subtotal} · Tax {quote.taxAmount}
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
                        variant="secondary"
                        disabled={quote.status !== "approved" || convertQuoteMutation.isPending}
                        onClick={() => handleConvertQuote(quote.id)}
                        type="button"
                      >
                        Convert to Project + Invoice
                      </Button>
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
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <Receipt className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateInvoice}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Select value={invoiceForm.clientId} onValueChange={(value) => setInvoiceForm((current) => ({ ...current, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsQuery.data?.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={invoiceForm.projectId || "none"} onValueChange={(value) => setInvoiceForm((current) => ({ ...current, projectId: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked project</SelectItem>
                      {projectsQuery.data?.map((project) => (
                        <SelectItem key={project.id} value={String(project.id)}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={invoiceForm.quoteId || "none"} onValueChange={(value) => setInvoiceForm((current) => ({ ...current, quoteId: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional quote" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked quote</SelectItem>
                      {quotesQuery.data?.map((quote) => (
                        <SelectItem key={quote.id} value={String(quote.id)}>
                          {quote.quoteNumber}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                  <Input
                    placeholder="Currency"
                    value={invoiceForm.currency}
                    onChange={(event) => setInvoiceForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                  />
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
                          Due {invoice.balanceDue} · Paid {invoice.amountPaid}
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
                </div>
                <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
                  <LifeBuoy className="h-5 w-5" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form className="grid gap-4" onSubmit={handleCreateSubscription}>
                <div className="grid gap-4 lg:grid-cols-3">
                  <Select value={subscriptionForm.clientId} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, clientId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clientsQuery.data?.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={subscriptionForm.projectId || "none"} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, projectId: value === "none" ? "" : value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Optional project" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No linked project</SelectItem>
                      {projectsQuery.data?.map((project) => (
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
                  <Select value={subscriptionForm.status} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, status: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionStatusOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Currency"
                    value={subscriptionForm.currency}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, currency: event.target.value.toUpperCase() }))}
                  />

                  <Input
                    placeholder="Amount"
                    value={subscriptionForm.amount}
                    onChange={(event) => setSubscriptionForm((current) => ({ ...current, amount: event.target.value }))}
                  />

                  <Select value={subscriptionForm.interval} onValueChange={(value) => setSubscriptionForm((current) => ({ ...current, interval: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Interval" />
                    </SelectTrigger>
                    <SelectContent>
                      {subscriptionIntervalOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {option}
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
                        <p className="text-sm text-muted-foreground">{subscription.clientName}{subscription.projectName ? ` · ${subscription.projectName}` : ""}</p>
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