import type { Dispatch, FormEvent, SetStateAction } from "react";

import { ScopeRichText } from "@/components/ScopeRichText";
import { PaymentTermsSummary } from "@/components/PaymentTermsSummary";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type {
  AdminClient,
  AdminDashboardSummary,
  AdminInvoice,
  AdminProject,
  AdminQuote,
  AdminSubscription,
  AdminSubscriptionEvent,
} from "@shared/routes";
import {
  type BillingModel,
  billingModelOptions,
  type ClientStatus,
  clientStatusOptions,
  type PaymentTermsType,
  paymentTermsTypeOptions,
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
  FileCheck2,
  FileSignature,
  FileText,
  LifeBuoy,
  LogOut,
  Mail,
  Receipt,
  Users,
} from "lucide-react";

type ClientFormState = {
  name: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactPhone: string;
  companyName: string;
  status: ClientStatus;
  notes: string;
};

type ProjectFormState = {
  clientId: string;
  name: string;
  description: string;
  billingModel: BillingModel;
  currency: SupportedCurrency;
  oneOffAmount: string;
  monthlyRetainerAmount: string;
  estimatedRetainerMonths: string;
};

type QuoteFormState = {
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
};

type InvoiceFormState = {
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
};

type SubscriptionFormState = {
  clientId: string;
  projectId: string;
  name: string;
  status: SubscriptionStatus;
  currency: SupportedCurrency;
  amount: string;
  interval: SubscriptionInterval;
};

type AdminWorkspaceProps = {
  sessionName?: string | null;
  sessionEmail?: string | null;
  dashboard?: AdminDashboardSummary;
  dashboardLoading: boolean;
  clients: AdminClient[];
  projects: AdminProject[];
  quotes: AdminQuote[];
  invoices: AdminInvoice[];
  subscriptions: AdminSubscription[];
  subscriptionEvents: AdminSubscriptionEvent[];
  selectedClient: AdminClient | null;
  selectedProject: AdminProject | null;
  selectedQuote: AdminQuote | null;
  workspaceClientId: string;
  workspaceProjectId: string;
  workspaceQuoteId: string;
  clientForm: ClientFormState;
  setClientForm: Dispatch<SetStateAction<ClientFormState>>;
  projectForm: ProjectFormState;
  setProjectForm: Dispatch<SetStateAction<ProjectFormState>>;
  quoteForm: QuoteFormState;
  setQuoteForm: Dispatch<SetStateAction<QuoteFormState>>;
  invoiceForm: InvoiceFormState;
  setInvoiceForm: Dispatch<SetStateAction<InvoiceFormState>>;
  subscriptionForm: SubscriptionFormState;
  setSubscriptionForm: Dispatch<SetStateAction<SubscriptionFormState>>;
  createClientPending: boolean;
  createProjectPending: boolean;
  createQuotePending: boolean;
  createInvoicePending: boolean;
  createSubscriptionPending: boolean;
  convertQuotePending: boolean;
  updateSubscriptionPending: boolean;
  logoutPending: boolean;
  onSubmitClient: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitProject: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitQuote: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitInvoice: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onSubmitSubscription: (event: FormEvent<HTMLFormElement>) => Promise<void>;
  onCreateClientFromInquiry: (
    inquiry: AdminDashboardSummary["recentInquiries"][number],
  ) => Promise<void>;
  onConvertQuote: (quoteId: number) => Promise<void>;
  onUpdateSubscription: (
    subscriptionId: number,
    input: { status?: SubscriptionStatus; cancelAtPeriodEnd?: boolean },
  ) => Promise<void>;
  onLogout: () => Promise<void>;
  onSelectClient: (clientId: string) => void;
  onSelectProject: (projectId: string) => void;
  onSelectQuote: (quoteId: string) => void;
  onCopyQuoteApprovalLink: (quote: AdminQuote) => Promise<void>;
};

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

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return "Not set";
  }

  return new Date(value).toLocaleDateString();
}

function formatAmount(currency: string, value: string | number | null | undefined) {
  if (typeof value === "number") {
    return `${currency} ${value.toFixed(2)}`;
  }

  return `${currency} ${value ?? "0.00"}`;
}

function getProjectCommercialLabel(project: AdminProject) {
  return project.billingModel === "retainer" ? "Retainer" : "Core project";
}

function MetricCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: typeof Users;
}) {
  return (
    <Card className="border-border/50 bg-card/85">
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-3 font-display text-4xl text-primary">{value}</CardTitle>
        </div>
        <div className="rounded-full border border-border/60 bg-background/70 p-3 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardHeader>
    </Card>
  );
}

function PaymentTermsFields({
  paymentTermsType,
  depositPercentage,
  paymentTermsNote,
  onChange,
}: {
  paymentTermsType: PaymentTermsType;
  depositPercentage: string;
  paymentTermsNote: string;
  onChange: (input: {
    paymentTermsType?: PaymentTermsType;
    depositPercentage?: string;
    paymentTermsNote?: string;
  }) => void;
}) {
  const showDepositField = paymentTermsType !== "retainer";

  return (
    <div className="space-y-4 rounded-2xl border border-border/50 bg-background/60 p-4">
      <div className="flex items-center gap-3">
        <CircleDollarSign className="h-4 w-4 text-primary" />
        <div>
          <p className="text-sm font-medium text-foreground">Payment terms</p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Define the billing structure directly on the commercial record.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          value={paymentTermsType}
          onValueChange={(value) => onChange({ paymentTermsType: value as PaymentTermsType })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select payment terms" />
          </SelectTrigger>
          <SelectContent>
            {paymentTermsTypeOptions.map((option) => (
              <SelectItem key={option} value={option}>
                {formatLabel(option)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {showDepositField ? (
          <Input
            placeholder="Deposit percentage"
            value={depositPercentage}
            onChange={(event) => onChange({ depositPercentage: event.target.value })}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border/60 bg-card/60 px-4 py-3 text-sm text-muted-foreground">
            Retainer billing does not need a separate upfront percentage.
          </div>
        )}
      </div>

      <Textarea
        placeholder="Optional note the client should see, e.g. 50% upfront to begin, balance due on delivery."
        value={paymentTermsNote}
        onChange={(event) => onChange({ paymentTermsNote: event.target.value })}
      />

      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <p className="text-xs uppercase tracking-[0.18em] text-primary">Client-facing summary</p>
        <PaymentTermsSummary
          className="mt-3"
          paymentTermsType={paymentTermsType}
          depositPercentage={depositPercentage ? Number(depositPercentage) : null}
          paymentTermsNote={paymentTermsNote || null}
        />
      </div>
    </div>
  );
}

export function AdminWorkspace({
  sessionName,
  sessionEmail,
  dashboard,
  dashboardLoading,
  clients,
  projects,
  quotes,
  invoices,
  subscriptions,
  subscriptionEvents,
  selectedClient,
  selectedProject,
  selectedQuote,
  workspaceClientId,
  workspaceProjectId,
  workspaceQuoteId,
  clientForm,
  setClientForm,
  projectForm,
  setProjectForm,
  quoteForm,
  setQuoteForm,
  invoiceForm,
  setInvoiceForm,
  subscriptionForm,
  setSubscriptionForm,
  createClientPending,
  createProjectPending,
  createQuotePending,
  createInvoicePending,
  createSubscriptionPending,
  convertQuotePending,
  updateSubscriptionPending,
  logoutPending,
  onSubmitClient,
  onSubmitProject,
  onSubmitQuote,
  onSubmitInvoice,
  onSubmitSubscription,
  onCreateClientFromInquiry,
  onConvertQuote,
  onUpdateSubscription,
  onLogout,
  onSelectClient,
  onSelectProject,
  onSelectQuote,
  onCopyQuoteApprovalLink,
}: AdminWorkspaceProps) {
  const hasFocus = Boolean(selectedClient);
  const clientProjects = selectedClient
    ? projects.filter((project) => project.clientId === selectedClient.id)
    : [];
  const clientQuotes = selectedClient
    ? quotes.filter((quote) => quote.clientId === selectedClient.id)
    : [];
  const clientInvoices = selectedClient
    ? invoices.filter((invoice) => invoice.clientId === selectedClient.id)
    : [];
  const selectedProjectQuotes = selectedProject
    ? quotes.filter((quote) => quote.projectId === selectedProject.id)
    : [];
  const selectedProjectInvoices = selectedProject
    ? invoices.filter((invoice) => invoice.projectId === selectedProject.id)
    : [];
  const selectedProjectReceipts = selectedProjectInvoices.filter((invoice) => invoice.status === "paid");
  const selectedProjectSubscriptions = selectedProject
    ? subscriptions.filter((subscription) => subscription.projectId === selectedProject.id)
    : [];
  const selectedSubscriptionIds = new Set(
    selectedProjectSubscriptions.map((subscription) => subscription.id),
  );
  const selectedProjectEvents = subscriptionEvents.filter((event) =>
    selectedSubscriptionIds.has(event.subscriptionId),
  );
  const nextRecommendedMove = !selectedClient
    ? "Create or open a client workspace first."
    : !selectedProject
      ? "Create the project under this client so all billing stays contained."
      : !selectedQuote
        ? "Draft the commercial scope for this project next."
        : "This project is connected. Continue with invoices, receipts, or ongoing retainer billing.";

  return (
    <div className="min-h-screen bg-background px-6 py-8 text-foreground md:px-12">
      <main className="mx-auto max-w-7xl space-y-8">
        <section className="grid gap-6 rounded-[2rem] border border-border/40 bg-card px-8 py-8 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
          <div className="space-y-4">
            <Badge variant="outline" className="border-primary/30 text-primary">
              Relief Works Admin
            </Badge>
            <div className="space-y-3">
              <h1 className="font-display text-4xl leading-tight text-primary md:text-6xl">
                Client work, project delivery, and billing in one contained workspace.
              </h1>
              <p className="max-w-3xl text-lg leading-relaxed text-muted-foreground">
                The structure is now simple: create a client, create a project under that client,
                then keep quotes, invoices, receipts, and maintenance billing attached to that
                project.
              </p>
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-border/50 bg-background/70 p-5">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Signed in as</p>
            <p className="mt-3 text-lg font-medium text-foreground">{sessionName || "Admin"}</p>
            <p className="text-sm text-muted-foreground">{sessionEmail || "No email configured"}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {hasFocus ? (
                <Button type="button" variant="outline" onClick={() => onSelectClient("")}>
                  Exit Focus Mode
                </Button>
              ) : null}
              <Button type="button" variant="outline" onClick={() => void onLogout()} disabled={logoutPending}>
                <LogOut className="h-4 w-4" />
                {logoutPending ? "Closing..." : "Log Out"}
              </Button>
            </div>
          </div>
        </section>

        {!hasFocus ? (
          <>
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {metricMeta.map(({ key, label, icon }) => (
                <MetricCard
                  key={key}
                  label={label}
                  value={dashboardLoading ? 0 : dashboard?.totals[key] ?? 0}
                  icon={icon}
                />
              ))}
            </section>

            <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
              <Card className="border-border/50 bg-card/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-primary">
                    Incoming inquiries
                  </CardTitle>
                  <CardDescription>
                    These stay separate from the delivery workspace until you convert them into
                    clients.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {dashboardLoading ? (
                    <p className="text-sm text-muted-foreground">Loading inquiry activity...</p>
                  ) : null}

                  {!dashboardLoading && (dashboard?.recentInquiries.length ?? 0) === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No inquiries yet. When one lands, you can convert it into a client workspace
                      from here.
                    </p>
                  ) : null}

                  {dashboard?.recentInquiries.map((inquiry) => (
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
                            {inquiry.company ? <span>{inquiry.company}</span> : null}
                            {inquiry.role ? <span>{inquiry.role}</span> : null}
                          </div>
                        </div>
                        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                          {formatDate(inquiry.createdAt)}
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
                          disabled={createClientPending}
                          onClick={() => void onCreateClientFromInquiry(inquiry)}
                        >
                          Create Client From Inquiry
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card className="border-border/50 bg-card/85">
                  <CardHeader>
                    <CardTitle className="font-display text-3xl text-primary">
                      Create client
                    </CardTitle>
                    <CardDescription>
                      This is the first step. Projects and billing records will inherit this
                      account context.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="grid gap-4" onSubmit={(event) => void onSubmitClient(event)}>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Input
                          placeholder="Client name"
                          value={clientForm.name}
                          onChange={(event) =>
                            setClientForm((current) => ({ ...current, name: event.target.value }))
                          }
                        />
                        <Input
                          placeholder="Company name"
                          value={clientForm.companyName}
                          onChange={(event) =>
                            setClientForm((current) => ({
                              ...current,
                              companyName: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Primary contact"
                          value={clientForm.primaryContactName}
                          onChange={(event) =>
                            setClientForm((current) => ({
                              ...current,
                              primaryContactName: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Primary email"
                          type="email"
                          value={clientForm.primaryContactEmail}
                          onChange={(event) =>
                            setClientForm((current) => ({
                              ...current,
                              primaryContactEmail: event.target.value,
                            }))
                          }
                        />
                        <Input
                          placeholder="Phone"
                          value={clientForm.primaryContactPhone}
                          onChange={(event) =>
                            setClientForm((current) => ({
                              ...current,
                              primaryContactPhone: event.target.value,
                            }))
                          }
                        />
                        <Select
                          value={clientForm.status}
                          onValueChange={(value) =>
                            setClientForm((current) => ({
                              ...current,
                              status: value as ClientStatus,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Client status" />
                          </SelectTrigger>
                          <SelectContent>
                            {clientStatusOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {formatLabel(option)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Textarea
                        placeholder="Operational notes, context, or delivery details"
                        value={clientForm.notes}
                        onChange={(event) =>
                          setClientForm((current) => ({ ...current, notes: event.target.value }))
                        }
                      />
                      <Button type="submit" disabled={createClientPending}>
                        {createClientPending ? "Creating client..." : "Create Client"}
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/85">
                  <CardHeader>
                    <CardTitle className="font-display text-3xl text-primary">
                      Client workspaces
                    </CardTitle>
                    <CardDescription>
                      Pick a client to enter focus mode and continue inside their projects.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {clients.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        No clients yet. Create the first one above.
                      </p>
                    ) : null}

                    {clients.map((client) => (
                      <div
                        key={client.id}
                        className="rounded-2xl border border-border/50 bg-background/65 p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="text-lg font-medium text-foreground">{client.name}</h3>
                              <Badge variant="outline">{formatLabel(client.status)}</Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {client.companyName || "No company specified"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {client.primaryContactName || client.primaryContactEmail}
                            </p>
                          </div>

                          <Button type="button" size="sm" variant="outline" onClick={() => onSelectClient(String(client.id))}>
                            Open Workspace
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </section>
          </>
        ) : (
          <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            <div className="space-y-6">
              <Card className="border-border/50 bg-card/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-primary">Client context</CardTitle>
                  <CardDescription>
                    Switch the active client here. Everything else stays contained under that
                    account.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Select value={workspaceClientId} onValueChange={onSelectClient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={String(client.id)}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {selectedClient ? (
                    <div className="space-y-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium text-foreground">{selectedClient.name}</h3>
                        <Badge variant="outline">{formatLabel(selectedClient.status)}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedClient.primaryContactEmail}
                      </p>
                      <div className="grid gap-3 text-sm text-muted-foreground">
                        <p>{clientProjects.length} project(s)</p>
                        <p>{clientQuotes.length} quote(s)</p>
                        <p>{clientInvoices.length} invoice(s)</p>
                      </div>
                    </div>
                  ) : null}
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-primary">
                    Create project
                  </CardTitle>
                  <CardDescription>
                    Build the delivery container once, then attach every commercial step to it.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form className="grid gap-4" onSubmit={(event) => void onSubmitProject(event)}>
                    <Input value={selectedClient?.name || ""} disabled />
                    <Input
                      placeholder="Project name"
                      value={projectForm.name}
                      onChange={(event) =>
                        setProjectForm((current) => ({ ...current, name: event.target.value }))
                      }
                    />
                    <Textarea
                      placeholder="Scope summary or delivery context"
                      value={projectForm.description}
                      onChange={(event) =>
                        setProjectForm((current) => ({
                          ...current,
                          description: event.target.value,
                        }))
                      }
                    />
                    <Select
                      value={projectForm.billingModel}
                      onValueChange={(value) =>
                        setProjectForm((current) => ({
                          ...current,
                          billingModel: value as BillingModel,
                        }))
                      }
                    >
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
                    <Select
                      value={projectForm.currency}
                      onValueChange={(value) =>
                        setProjectForm((current) => ({
                          ...current,
                          currency: value as SupportedCurrency,
                        }))
                      }
                    >
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

                    {projectForm.billingModel !== "retainer" ? (
                      <Input
                        placeholder={projectForm.billingModel === "hybrid" ? "Setup amount" : "Build amount"}
                        value={projectForm.oneOffAmount}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            oneOffAmount: event.target.value,
                          }))
                        }
                      />
                    ) : null}

                    {projectForm.billingModel !== "one_off" ? (
                      <Input
                        placeholder="Monthly maintenance amount"
                        value={projectForm.monthlyRetainerAmount}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            monthlyRetainerAmount: event.target.value,
                          }))
                        }
                      />
                    ) : null}

                    {projectForm.billingModel === "retainer" ? (
                      <Input
                        placeholder="Estimated retainer months"
                        value={projectForm.estimatedRetainerMonths}
                        onChange={(event) =>
                          setProjectForm((current) => ({
                            ...current,
                            estimatedRetainerMonths: event.target.value,
                          }))
                        }
                      />
                    ) : null}

                    <Button type="submit" disabled={createProjectPending}>
                      {createProjectPending ? "Creating project..." : "Create Project"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="border-border/50 bg-card/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-primary">
                    Client projects
                  </CardTitle>
                  <CardDescription>
                    Open one project and stay inside it for quotes, invoices, receipts, and
                    retained work.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {clientProjects.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No projects yet for this client. Create one above to start the contained
                      workflow.
                    </p>
                  ) : null}

                  {clientProjects.map((project) => (
                    <button
                      key={project.id}
                      type="button"
                      onClick={() => onSelectProject(String(project.id))}
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        workspaceProjectId === String(project.id)
                          ? "border-primary/40 bg-primary/5"
                          : "border-border/50 bg-background/65"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-lg font-medium text-foreground">{project.name}</p>
                            <Badge variant="outline">{formatLabel(project.lifecycleStatus)}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {getProjectCommercialLabel(project)} / {formatLabel(project.billingModel)}
                          </p>
                        </div>
                        <ArrowRightLeft className="h-4 w-4 text-primary" />
                      </div>
                    </button>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card className="border-border/50 bg-card/85">
                <CardHeader>
                  <CardTitle className="font-display text-3xl text-primary">
                    Workspace focus
                  </CardTitle>
                  <CardDescription>{nextRecommendedMove}</CardDescription>
                </CardHeader>
                <CardContent>
                  {selectedProject ? (
                    <div className="space-y-5">
                      <div className="grid gap-4 md:grid-cols-4">
                        <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Billing model
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {formatLabel(selectedProject.billingModel)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Lifecycle
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {formatLabel(selectedProject.lifecycleStatus)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Core amount
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {formatAmount(selectedProject.currency, selectedProject.oneOffAmount)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                          <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                            Monthly amount
                          </p>
                          <p className="mt-2 font-medium text-foreground">
                            {formatAmount(
                              selectedProject.currency,
                              selectedProject.monthlyRetainerAmount,
                            )}
                          </p>
                        </div>
                      </div>

                      {selectedProject.description ? (
                        <div className="rounded-2xl border border-border/50 bg-background/65 p-5">
                          <p className="text-xs uppercase tracking-[0.18em] text-primary">
                            Relief Works project scope
                          </p>
                          <ScopeRichText content={selectedProject.description} className="mt-3" />
                        </div>
                      ) : null}

                      <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-4 text-sm leading-relaxed text-muted-foreground">
                        Use separate quotes inside this same project for the core build, feature
                        additions, extra phases, change requests, or support extensions. That keeps
                        every commercial step tracked under one delivery record.
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-primary/30 bg-primary/5 p-6">
                      <p className="font-medium text-foreground">Pick a project to enter billing focus.</p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        Once a project is selected, quote drafting, invoice creation, receipts, and
                        retainer tracking will stay contained inside that project.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {selectedProject ? (
                <>
                  <section className="grid gap-6 xl:grid-cols-2">
                    <Card className="border-border/50 bg-card/85">
                      <CardHeader>
                        <CardTitle className="font-display text-3xl text-primary">
                          Create quote
                        </CardTitle>
                        <CardDescription>
                          Draft commercial scope for this project. Use the title to distinguish core
                          delivery, add-ons, or feature phases.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form className="grid gap-4" onSubmit={(event) => void onSubmitQuote(event)}>
                          <Input
                            placeholder="Quote title"
                            value={quoteForm.title}
                            onChange={(event) =>
                              setQuoteForm((current) => ({ ...current, title: event.target.value }))
                            }
                          />
                          <Input
                            placeholder="Recipient email"
                            type="email"
                            value={quoteForm.recipientEmail}
                            onChange={(event) =>
                              setQuoteForm((current) => ({
                                ...current,
                                recipientEmail: event.target.value,
                              }))
                            }
                          />
                          <div className="grid gap-4 md:grid-cols-3">
                            <Input value={selectedProject.currency} disabled />
                            <Input
                              placeholder="Subtotal"
                              value={quoteForm.subtotal}
                              onChange={(event) =>
                                setQuoteForm((current) => ({
                                  ...current,
                                  subtotal: event.target.value,
                                }))
                              }
                            />
                            <Input
                              placeholder="Tax amount"
                              value={quoteForm.taxAmount}
                              onChange={(event) =>
                                setQuoteForm((current) => ({
                                  ...current,
                                  taxAmount: event.target.value,
                                }))
                              }
                            />
                          </div>
                          <Input
                            type="date"
                            value={quoteForm.expiresAt}
                            onChange={(event) =>
                              setQuoteForm((current) => ({
                                ...current,
                                expiresAt: event.target.value,
                              }))
                            }
                          />
                          <Textarea
                            className="min-h-[220px]"
                            placeholder="Paste the scope here with headings, bullets, and notes."
                            value={quoteForm.scope}
                            onChange={(event) =>
                              setQuoteForm((current) => ({ ...current, scope: event.target.value }))
                            }
                          />

                          <PaymentTermsFields
                            paymentTermsType={quoteForm.paymentTermsType}
                            depositPercentage={quoteForm.depositPercentage}
                            paymentTermsNote={quoteForm.paymentTermsNote}
                            onChange={(input) =>
                              setQuoteForm((current) => ({ ...current, ...input }))
                            }
                          />

                          {quoteForm.scope.trim() ? (
                            <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                Scope preview
                              </p>
                              <ScopeRichText content={quoteForm.scope} className="mt-3" />
                            </div>
                          ) : null}

                          <Button type="submit" disabled={createQuotePending}>
                            {createQuotePending ? "Creating quote..." : "Create Quote"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/85">
                      <CardHeader>
                        <CardTitle className="font-display text-3xl text-primary">
                          Create invoice
                        </CardTitle>
                        <CardDescription>
                          Bill this project directly or anchor the invoice to an approved quote.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form className="grid gap-4" onSubmit={(event) => void onSubmitInvoice(event)}>
                          <Select
                            value={invoiceForm.quoteId || "none"}
                            onValueChange={(value) =>
                              setInvoiceForm((current) => ({
                                ...current,
                                quoteId: value === "none" ? "" : value,
                              }))
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Link to a quote (optional)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">No linked quote</SelectItem>
                              {selectedProjectQuotes.map((quote) => (
                                <SelectItem key={quote.id} value={String(quote.id)}>
                                  {quote.quoteNumber} / {quote.title}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          <div className="grid gap-4 md:grid-cols-3">
                            <Select
                              value={invoiceForm.currency}
                              onValueChange={(value) =>
                                setInvoiceForm((current) => ({
                                  ...current,
                                  currency: value as SupportedCurrency,
                                }))
                              }
                            >
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
                              onChange={(event) =>
                                setInvoiceForm((current) => ({
                                  ...current,
                                  subtotal: event.target.value,
                                }))
                              }
                            />
                            <Input
                              placeholder="Tax amount"
                              value={invoiceForm.taxAmount}
                              onChange={(event) =>
                                setInvoiceForm((current) => ({
                                  ...current,
                                  taxAmount: event.target.value,
                                }))
                              }
                            />
                          </div>

                          <Input
                            type="date"
                            value={invoiceForm.dueAt}
                            onChange={(event) =>
                              setInvoiceForm((current) => ({
                                ...current,
                                dueAt: event.target.value,
                              }))
                            }
                          />

                          <div className="flex items-center justify-between rounded-2xl border border-border/50 bg-background/60 p-4">
                            <div>
                              <p className="text-sm font-medium text-foreground">
                                Generate PayFast payment link
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Keep this on when the invoice should send out with a payment URL.
                              </p>
                            </div>
                            <Switch
                              checked={invoiceForm.createPaymentLink}
                              onCheckedChange={(checked) =>
                                setInvoiceForm((current) => ({
                                  ...current,
                                  createPaymentLink: checked,
                                }))
                              }
                            />
                          </div>

                          <PaymentTermsFields
                            paymentTermsType={invoiceForm.paymentTermsType}
                            depositPercentage={invoiceForm.depositPercentage}
                            paymentTermsNote={invoiceForm.paymentTermsNote}
                            onChange={(input) =>
                              setInvoiceForm((current) => ({ ...current, ...input }))
                            }
                          />

                          <Button type="submit" disabled={createInvoicePending}>
                            {createInvoicePending ? "Creating invoice..." : "Create Invoice"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </section>

                  <Card className="border-border/50 bg-card/85">
                    <CardHeader>
                      <CardTitle className="font-display text-3xl text-primary">
                        Project quotes
                      </CardTitle>
                      <CardDescription>
                        Every quote, phase, and feature addition under this project stays visible
                        here.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {selectedProjectQuotes.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                          No quotes yet for this project.
                        </p>
                      ) : null}

                      {selectedProjectQuotes.map((quote) => (
                        <div
                          key={quote.id}
                          className={`rounded-2xl border p-5 ${
                            workspaceQuoteId === String(quote.id)
                              ? "border-primary/40 bg-primary/5"
                              : "border-border/50 bg-background/65"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="text-lg font-medium text-foreground">
                                  {quote.quoteNumber}
                                </h3>
                                <Badge variant="outline">{formatLabel(quote.status)}</Badge>
                                {workspaceQuoteId === String(quote.id) ? (
                                  <Badge variant="secondary">Active</Badge>
                                ) : null}
                              </div>
                              <div>
                                <p className="font-medium text-foreground">{quote.title}</p>
                                <p className="text-sm text-muted-foreground">
                                  {formatAmount(quote.currency, quote.totalAmount)}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => onSelectQuote(String(quote.id))}
                              >
                                Focus Quote
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() => void onCopyQuoteApprovalLink(quote)}
                              >
                                Copy Approval Link
                              </Button>
                              {quote.status === "approved" ? (
                                <Button
                                  type="button"
                                  size="sm"
                                  disabled={convertQuotePending}
                                  onClick={() => void onConvertQuote(quote.id)}
                                >
                                  {convertQuotePending ? "Converting..." : "Convert To Invoice"}
                                </Button>
                              ) : null}
                            </div>
                          </div>

                          <div className="mt-4 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                            {quote.scope ? (
                              <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                  Relief Works scope
                                </p>
                                <ScopeRichText content={quote.scope} className="mt-3" />
                              </div>
                            ) : null}

                            <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                Payment terms
                              </p>
                              <PaymentTermsSummary
                                className="mt-3"
                                paymentTermsType={quote.paymentTermsType}
                                depositPercentage={quote.depositPercentage}
                                paymentTermsNote={quote.paymentTermsNote}
                              />
                              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                                <p>Subtotal: {formatAmount(quote.currency, quote.subtotal)}</p>
                                <p>Total: {formatAmount(quote.currency, quote.totalAmount)}</p>
                                <p>Expires: {formatDate(quote.expiresAt)}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                    <Card className="border-border/50 bg-card/85">
                      <CardHeader>
                        <CardTitle className="font-display text-3xl text-primary">
                          Project invoices
                        </CardTitle>
                        <CardDescription>
                          Billing stays attached to this project whether it came from a quote or a
                          direct admin invoice.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedProjectInvoices.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No invoices yet for this project.
                          </p>
                        ) : null}

                        {selectedProjectInvoices.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="rounded-2xl border border-border/50 bg-background/65 p-5"
                          >
                            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                              <div className="space-y-2">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="text-lg font-medium text-foreground">
                                    {invoice.invoiceNumber}
                                  </h3>
                                  <Badge variant="outline">{formatLabel(invoice.status)}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {invoice.quoteId ? `Linked to quote #${invoice.quoteId}` : "Direct project invoice"}
                                </p>
                              </div>

                              <div className="text-left lg:text-right">
                                <p className="text-lg font-medium text-primary">
                                  {formatAmount(invoice.currency, invoice.totalAmount)}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  Balance due: {formatAmount(invoice.currency, invoice.balanceDue)}
                                </p>
                              </div>
                            </div>

                            <div className="mt-4 grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
                              <div className="rounded-2xl border border-border/50 bg-card/70 p-4 text-sm text-muted-foreground">
                                <p>Subtotal: {formatAmount(invoice.currency, invoice.subtotal)}</p>
                                <p className="mt-2">Paid: {formatAmount(invoice.currency, invoice.amountPaid)}</p>
                                <p className="mt-2">Due: {formatDate(invoice.dueAt)}</p>
                                <p className="mt-2">Paid at: {formatDate(invoice.paidAt)}</p>
                                {invoice.paymentLink ? (
                                  <p className="mt-2 break-all text-primary">{invoice.paymentLink}</p>
                                ) : null}
                              </div>

                              <div className="rounded-2xl border border-border/50 bg-card/70 p-4">
                                <p className="text-xs uppercase tracking-[0.18em] text-primary">
                                  Payment terms
                                </p>
                                <PaymentTermsSummary
                                  className="mt-3"
                                  paymentTermsType={invoice.paymentTermsType}
                                  depositPercentage={invoice.depositPercentage}
                                  paymentTermsNote={invoice.paymentTermsNote}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    <Card className="border-border/50 bg-card/85">
                      <CardHeader>
                        <CardTitle className="font-display text-3xl text-primary">
                          Receipts
                        </CardTitle>
                        <CardDescription>
                          Paid invoices become the receipt history for this project.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {selectedProjectReceipts.length === 0 ? (
                          <p className="text-sm text-muted-foreground">
                            No paid invoices yet, so there are no receipts to track here.
                          </p>
                        ) : null}

                        {selectedProjectReceipts.map((invoice) => (
                          <div
                            key={invoice.id}
                            className="rounded-2xl border border-border/50 bg-background/65 p-4"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Receipt className="h-4 w-4 text-primary" />
                                  <p className="font-medium text-foreground">{invoice.invoiceNumber}</p>
                                </div>
                                <p className="mt-2 text-sm text-muted-foreground">
                                  Paid {formatDate(invoice.paidAt)}
                                </p>
                              </div>
                              <p className="font-medium text-primary">
                                {formatAmount(invoice.currency, invoice.amountPaid)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </section>

                  <Card className="border-border/50 bg-card/85">
                    <CardHeader>
                      <CardTitle className="font-display text-3xl text-primary">
                        Retainers and recurring support
                      </CardTitle>
                      <CardDescription>
                        Ongoing billing still belongs to the current project when maintenance or
                        feature support continues after launch.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form className="grid gap-4" onSubmit={(event) => void onSubmitSubscription(event)}>
                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <Input
                            placeholder="Subscription name"
                            value={subscriptionForm.name}
                            onChange={(event) =>
                              setSubscriptionForm((current) => ({
                                ...current,
                                name: event.target.value,
                              }))
                            }
                          />
                          <Select
                            value={subscriptionForm.status}
                            onValueChange={(value) =>
                              setSubscriptionForm((current) => ({
                                ...current,
                                status: value as SubscriptionStatus,
                              }))
                            }
                          >
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
                          <Select
                            value={subscriptionForm.currency}
                            onValueChange={(value) =>
                              setSubscriptionForm((current) => ({
                                ...current,
                                currency: value as SupportedCurrency,
                              }))
                            }
                          >
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
                            placeholder="Recurring amount"
                            value={subscriptionForm.amount}
                            onChange={(event) =>
                              setSubscriptionForm((current) => ({
                                ...current,
                                amount: event.target.value,
                              }))
                            }
                          />
                        </div>

                        <Select
                          value={subscriptionForm.interval}
                          onValueChange={(value) =>
                            setSubscriptionForm((current) => ({
                              ...current,
                              interval: value as SubscriptionInterval,
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Billing interval" />
                          </SelectTrigger>
                          <SelectContent>
                            {subscriptionIntervalOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                Every {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Button type="submit" disabled={createSubscriptionPending}>
                          {createSubscriptionPending ? "Creating subscription..." : "Create Subscription"}
                        </Button>
                      </form>

                      <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
                        <div className="space-y-4">
                          {selectedProjectSubscriptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No recurring support plans yet for this project.
                            </p>
                          ) : null}

                          {selectedProjectSubscriptions.map((subscription) => (
                            <div
                              key={subscription.id}
                              className="rounded-2xl border border-border/50 bg-background/65 p-5"
                            >
                              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                <div>
                                  <div className="flex flex-wrap items-center gap-2">
                                    <h3 className="text-lg font-medium text-foreground">
                                      {subscription.name}
                                    </h3>
                                    <Badge variant="outline">{formatLabel(subscription.status)}</Badge>
                                  </div>
                                  <p className="mt-2 text-sm text-muted-foreground">
                                    {formatAmount(subscription.currency, subscription.amount)} / every{" "}
                                    {subscription.interval}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={updateSubscriptionPending || subscription.status === "active"}
                                    onClick={() =>
                                      void onUpdateSubscription(subscription.id, {
                                        status: "active",
                                        cancelAtPeriodEnd: false,
                                      })
                                    }
                                  >
                                    Activate
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="secondary"
                                    disabled={updateSubscriptionPending || subscription.status === "paused"}
                                    onClick={() =>
                                      void onUpdateSubscription(subscription.id, { status: "paused" })
                                    }
                                  >
                                    Pause
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      updateSubscriptionPending || subscription.cancelAtPeriodEnd
                                    }
                                    onClick={() =>
                                      void onUpdateSubscription(subscription.id, {
                                        cancelAtPeriodEnd: true,
                                      })
                                    }
                                  >
                                    Cancel At Period End
                                  </Button>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    disabled={
                                      updateSubscriptionPending || !subscription.cancelAtPeriodEnd
                                    }
                                    onClick={() =>
                                      void onUpdateSubscription(subscription.id, {
                                        cancelAtPeriodEnd: false,
                                      })
                                    }
                                  >
                                    Reactivate
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-4">
                          <div className="rounded-2xl border border-border/50 bg-background/65 p-4">
                            <div className="flex items-center gap-3">
                              <LifeBuoy className="h-4 w-4 text-primary" />
                              <div>
                                <p className="font-medium text-foreground">Subscription event trail</p>
                                <p className="text-sm text-muted-foreground">
                                  Status changes and lifecycle events for this project&apos;s retained
                                  work.
                                </p>
                              </div>
                            </div>
                          </div>

                          {selectedProjectEvents.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                              No subscription events yet for this project.
                            </p>
                          ) : null}

                          {selectedProjectEvents.map((event) => (
                            <div
                              key={event.id}
                              className="rounded-2xl border border-border/50 bg-background/65 p-4"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge variant="outline">{formatLabel(event.toStatus)}</Badge>
                                <p className="text-sm text-muted-foreground">{event.subscriptionName}</p>
                              </div>
                              <p className="mt-2 text-sm text-muted-foreground">
                                {formatDate(event.createdAt)} / {event.source}
                              </p>
                              {event.note ? (
                                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                                  {event.note}
                                </p>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              ) : null}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
