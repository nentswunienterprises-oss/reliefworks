import { db } from "./db.ts";
import {
  asc,
  desc,
  eq,
  sql,
} from "drizzle-orm";
import {
  clients,
  inquiries,
  type InvoiceStatus,
  type InsertInvoice,
  type InsertQuote,
  type InsertSubscription,
  type PaymentProvider,
  type ProjectLifecycleStatus,
  projects,
  invoices,
  quotes,
  subscriptions,
  type SubscriptionStatus,
  subscriptionStatusEvents,
  type Client,
  type InsertClient,
  type InsertInquiry,
  type InsertProject,
  type InsertSubscriptionStatusEvent,
  type Inquiry,
  type Project,
} from "@shared/schema";

export interface AdminDashboardSummary {
  totals: {
    inquiries: number;
    clients: number;
    projects: number;
    quotes: number;
    invoices: number;
    subscriptions: number;
  };
  recentInquiries: Inquiry[];
}

export interface AdminProjectRecord extends Project {
  clientId: number;
  clientName: string;
  lifecycleStatus: ProjectLifecycleStatus;
  estimatedRetainerMonths: number | null;
}

export interface AdminQuoteRecord {
  id: number;
  clientId: number;
  clientName: string;
  projectId: number | null;
  projectName: string | null;
  quoteNumber: string;
  title: string;
  scope: string | null;
  status: string;
  currency: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  approvalToken: string | null;
  approvedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminInvoiceRecord {
  id: number;
  clientId: number;
  clientName: string;
  clientEmail: string;
  projectId: number | null;
  projectName: string | null;
  quoteId: number | null;
  invoiceNumber: string;
  status: string;
  currency: string;
  subtotal: string;
  taxAmount: string;
  totalAmount: string;
  amountPaid: string;
  balanceDue: string;
  dueAt: Date | null;
  paidAt: Date | null;
  paymentProvider: string | null;
  paymentLink: string | null;
  providerInvoiceId: string | null;
  publicToken: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSubscriptionRecord {
  id: number;
  clientId: number;
  clientName: string;
  projectId: number | null;
  projectName: string | null;
  name: string;
  status: string;
  currency: string;
  amount: string;
  interval: string;
  provider: string;
  providerSubscriptionId: string | null;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AdminSubscriptionEventRecord {
  id: number;
  subscriptionId: number;
  subscriptionName: string;
  clientName: string;
  fromStatus: string | null;
  toStatus: string;
  source: string;
  note: string | null;
  createdAt: Date;
}

export interface IStorage {
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  getAdminDashboardSummary(): Promise<AdminDashboardSummary>;
  listClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  listProjects(): Promise<AdminProjectRecord[]>;
  getProjectById(projectId: number): Promise<AdminProjectRecord | null>;
  createProject(project: InsertProject): Promise<AdminProjectRecord>;
  listQuotes(): Promise<AdminQuoteRecord[]>;
  getQuoteById(quoteId: number): Promise<AdminQuoteRecord | null>;
  getQuoteByApprovalToken(approvalToken: string): Promise<AdminQuoteRecord | null>;
  approveQuoteByApprovalToken(approvalToken: string): Promise<AdminQuoteRecord | null>;
  createQuote(quote: InsertQuote): Promise<AdminQuoteRecord>;
  listInvoices(): Promise<AdminInvoiceRecord[]>;
  getInvoiceByQuoteId(quoteId: number): Promise<AdminInvoiceRecord | null>;
  createInvoice(invoice: InsertInvoice): Promise<AdminInvoiceRecord>;
  listSubscriptions(): Promise<AdminSubscriptionRecord[]>;
  createSubscription(subscription: InsertSubscription): Promise<AdminSubscriptionRecord>;
  getSubscriptionById(subscriptionId: number): Promise<AdminSubscriptionRecord | null>;
  getSubscriptionByProviderId(providerSubscriptionId: string): Promise<AdminSubscriptionRecord | null>;
  updateSubscription(
    subscriptionId: number,
    input: {
      status?: SubscriptionStatus;
      cancelAtPeriodEnd?: boolean;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      providerSubscriptionId?: string | null;
    },
  ): Promise<AdminSubscriptionRecord | null>;
  createSubscriptionEvent(event: InsertSubscriptionStatusEvent): Promise<AdminSubscriptionEventRecord>;
  listSubscriptionEvents(limit?: number): Promise<AdminSubscriptionEventRecord[]>;
  updateInvoicePaymentDetails(
    invoiceId: number,
    details: {
      paymentProvider: PaymentProvider;
      paymentLink: string;
      providerInvoiceId: string;
      status?: InvoiceStatus;
    },
  ): Promise<AdminInvoiceRecord>;
  reconcileInvoiceFromPayfast(
    input: {
      publicToken: string;
      paymentStatus: string;
      providerPaymentId?: string;
      amountGross?: string;
    },
  ): Promise<AdminInvoiceRecord | null>;
  reconcileSubscriptionFromPayfast(input: {
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    cancelAtPeriodEnd?: boolean;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    note?: string;
  }): Promise<AdminSubscriptionRecord | null>;
}

const projectLifecycleStatusSql = sql<ProjectLifecycleStatus>`case
  when exists (select 1 from ${invoices} where ${invoices.projectId} = ${projects.id}) then 'invoiced'
  when exists (select 1 from ${quotes} where ${quotes.projectId} = ${projects.id} and ${quotes.status} = 'approved') then 'approved'
  when exists (select 1 from ${quotes} where ${quotes.projectId} = ${projects.id}) then 'quoted'
  else 'lead'
end`;

const projectEstimatedMonthsSql = sql<number | null>`case
  when ${projects.billingModel} = 'retainer'
    and ${projects.startDate} is not null
    and ${projects.endDate} is not null
  then greatest(
    1,
    (
      date_part('year', age(${projects.endDate}, ${projects.startDate})) * 12
      + date_part('month', age(${projects.endDate}, ${projects.startDate}))
    )::int
  )
  else null
end`;

export class DatabaseStorage implements IStorage {
  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const [
      inquiryCount,
      clientCount,
      projectCount,
      quoteCount,
      invoiceCount,
      subscriptionCount,
      recentInquiries,
    ] = await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(inquiries),
      db.select({ count: sql<number>`count(*)::int` }).from(clients),
      db.select({ count: sql<number>`count(*)::int` }).from(projects),
      db.select({ count: sql<number>`count(*)::int` }).from(quotes),
      db.select({ count: sql<number>`count(*)::int` }).from(invoices),
      db.select({ count: sql<number>`count(*)::int` }).from(subscriptions),
      db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(5),
    ]);

    return {
      totals: {
        inquiries: inquiryCount[0]?.count ?? 0,
        clients: clientCount[0]?.count ?? 0,
        projects: projectCount[0]?.count ?? 0,
        quotes: quoteCount[0]?.count ?? 0,
        invoices: invoiceCount[0]?.count ?? 0,
        subscriptions: subscriptionCount[0]?.count ?? 0,
      },
      recentInquiries,
    };
  }

  async listClients(): Promise<Client[]> {
    return db.select().from(clients).orderBy(asc(clients.name));
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async listProjects(): Promise<AdminProjectRecord[]> {
    const rows = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        lifecycleStatus: projectLifecycleStatusSql,
        billingModel: projects.billingModel,
        currency: projects.currency,
        oneOffAmount: projects.oneOffAmount,
        monthlyRetainerAmount: projects.monthlyRetainerAmount,
        estimatedRetainerMonths: projectEstimatedMonthsSql,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .orderBy(desc(projects.createdAt));

    return rows;
  }

  async getProjectById(projectId: number): Promise<AdminProjectRecord | null> {
    const rows = await db
      .select({
        id: projects.id,
        clientId: projects.clientId,
        clientName: clients.name,
        name: projects.name,
        description: projects.description,
        status: projects.status,
        lifecycleStatus: projectLifecycleStatusSql,
        billingModel: projects.billingModel,
        currency: projects.currency,
        oneOffAmount: projects.oneOffAmount,
        monthlyRetainerAmount: projects.monthlyRetainerAmount,
        estimatedRetainerMonths: projectEstimatedMonthsSql,
        startDate: projects.startDate,
        endDate: projects.endDate,
        createdAt: projects.createdAt,
        updatedAt: projects.updatedAt,
      })
      .from(projects)
      .innerJoin(clients, eq(projects.clientId, clients.id))
      .where(eq(projects.id, projectId))
      .limit(1);

    return rows[0] ?? null;
  }

  async createProject(insertProject: InsertProject): Promise<AdminProjectRecord> {
    const [project] = await db.insert(projects).values(insertProject).returning();
    const created = await this.getProjectById(project.id);
    if (!created) {
      throw new Error("Project could not be loaded after creation");
    }
    return created;
  }

  async listQuotes(): Promise<AdminQuoteRecord[]> {
    return db
      .select({
        id: quotes.id,
        clientId: quotes.clientId,
        clientName: clients.name,
        projectId: quotes.projectId,
        projectName: projects.name,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        scope: quotes.scope,
        status: quotes.status,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        totalAmount: quotes.totalAmount,
        approvalToken: quotes.approvalToken,
        approvedAt: quotes.approvedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .innerJoin(clients, eq(quotes.clientId, clients.id))
      .leftJoin(projects, eq(quotes.projectId, projects.id))
      .orderBy(desc(quotes.createdAt));
  }

  async getQuoteById(quoteId: number): Promise<AdminQuoteRecord | null> {
    const rows = await db
      .select({
        id: quotes.id,
        clientId: quotes.clientId,
        clientName: clients.name,
        projectId: quotes.projectId,
        projectName: projects.name,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        scope: quotes.scope,
        status: quotes.status,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        totalAmount: quotes.totalAmount,
        approvalToken: quotes.approvalToken,
        approvedAt: quotes.approvedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .innerJoin(clients, eq(quotes.clientId, clients.id))
      .leftJoin(projects, eq(quotes.projectId, projects.id))
      .where(eq(quotes.id, quoteId));

    return rows[0] ?? null;
  }

  async getQuoteByApprovalToken(approvalToken: string): Promise<AdminQuoteRecord | null> {
    const rows = await db
      .select({
        id: quotes.id,
        clientId: quotes.clientId,
        clientName: clients.name,
        projectId: quotes.projectId,
        projectName: projects.name,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        scope: quotes.scope,
        status: quotes.status,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        totalAmount: quotes.totalAmount,
        approvalToken: quotes.approvalToken,
        approvedAt: quotes.approvedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .innerJoin(clients, eq(quotes.clientId, clients.id))
      .leftJoin(projects, eq(quotes.projectId, projects.id))
      .where(eq(quotes.approvalToken, approvalToken));

    return rows[0] ?? null;
  }

  async approveQuoteByApprovalToken(approvalToken: string): Promise<AdminQuoteRecord | null> {
    const existing = await this.getQuoteByApprovalToken(approvalToken);

    if (!existing) {
      return null;
    }

    if (existing.status !== "approved") {
      await db
        .update(quotes)
        .set({
          status: "approved",
          approvedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(quotes.id, existing.id));
    }

    return this.getQuoteById(existing.id);
  }

  async createQuote(insertQuote: InsertQuote): Promise<AdminQuoteRecord> {
    const [quote] = await db.insert(quotes).values(insertQuote).returning();

    const rows = await db
      .select({
        id: quotes.id,
        clientId: quotes.clientId,
        clientName: clients.name,
        projectId: quotes.projectId,
        projectName: projects.name,
        quoteNumber: quotes.quoteNumber,
        title: quotes.title,
        scope: quotes.scope,
        status: quotes.status,
        currency: quotes.currency,
        subtotal: quotes.subtotal,
        taxAmount: quotes.taxAmount,
        totalAmount: quotes.totalAmount,
        approvalToken: quotes.approvalToken,
        approvedAt: quotes.approvedAt,
        expiresAt: quotes.expiresAt,
        createdAt: quotes.createdAt,
        updatedAt: quotes.updatedAt,
      })
      .from(quotes)
      .innerJoin(clients, eq(quotes.clientId, clients.id))
      .leftJoin(projects, eq(quotes.projectId, projects.id))
      .where(eq(quotes.id, quote.id));

    return rows[0];
  }

  async listInvoices(): Promise<AdminInvoiceRecord[]> {
    return db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.primaryContactEmail,
        projectId: invoices.projectId,
        projectName: projects.name,
        quoteId: invoices.quoteId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        amountPaid: invoices.amountPaid,
        balanceDue: invoices.balanceDue,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        paymentProvider: invoices.paymentProvider,
        paymentLink: invoices.paymentLink,
        providerInvoiceId: invoices.providerInvoiceId,
        publicToken: invoices.publicToken,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .orderBy(desc(invoices.createdAt));
  }

  async getInvoiceByQuoteId(quoteId: number): Promise<AdminInvoiceRecord | null> {
    const rows = await db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.primaryContactEmail,
        projectId: invoices.projectId,
        projectName: projects.name,
        quoteId: invoices.quoteId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        amountPaid: invoices.amountPaid,
        balanceDue: invoices.balanceDue,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        paymentProvider: invoices.paymentProvider,
        paymentLink: invoices.paymentLink,
        providerInvoiceId: invoices.providerInvoiceId,
        publicToken: invoices.publicToken,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.quoteId, quoteId))
      .orderBy(desc(invoices.createdAt))
      .limit(1);

    return rows[0] ?? null;
  }

  async createInvoice(insertInvoice: InsertInvoice): Promise<AdminInvoiceRecord> {
    const [invoice] = await db.insert(invoices).values(insertInvoice).returning();

    const rows = await db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.primaryContactEmail,
        projectId: invoices.projectId,
        projectName: projects.name,
        quoteId: invoices.quoteId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        amountPaid: invoices.amountPaid,
        balanceDue: invoices.balanceDue,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        paymentProvider: invoices.paymentProvider,
        paymentLink: invoices.paymentLink,
        providerInvoiceId: invoices.providerInvoiceId,
        publicToken: invoices.publicToken,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.id, invoice.id));

    return rows[0];
  }

  async listSubscriptions(): Promise<AdminSubscriptionRecord[]> {
    return db
      .select({
        id: subscriptions.id,
        clientId: subscriptions.clientId,
        clientName: clients.name,
        projectId: subscriptions.projectId,
        projectName: projects.name,
        name: subscriptions.name,
        status: subscriptions.status,
        currency: subscriptions.currency,
        amount: subscriptions.amount,
        interval: subscriptions.interval,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .leftJoin(projects, eq(subscriptions.projectId, projects.id))
      .orderBy(desc(subscriptions.createdAt));
  }

  async createSubscription(insertSubscription: InsertSubscription): Promise<AdminSubscriptionRecord> {
    const [subscription] = await db.insert(subscriptions).values(insertSubscription).returning();

    const rows = await db
      .select({
        id: subscriptions.id,
        clientId: subscriptions.clientId,
        clientName: clients.name,
        projectId: subscriptions.projectId,
        projectName: projects.name,
        name: subscriptions.name,
        status: subscriptions.status,
        currency: subscriptions.currency,
        amount: subscriptions.amount,
        interval: subscriptions.interval,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .leftJoin(projects, eq(subscriptions.projectId, projects.id))
      .where(eq(subscriptions.id, subscription.id));

    return rows[0];
  }

  async getSubscriptionById(subscriptionId: number): Promise<AdminSubscriptionRecord | null> {
    const rows = await db
      .select({
        id: subscriptions.id,
        clientId: subscriptions.clientId,
        clientName: clients.name,
        projectId: subscriptions.projectId,
        projectName: projects.name,
        name: subscriptions.name,
        status: subscriptions.status,
        currency: subscriptions.currency,
        amount: subscriptions.amount,
        interval: subscriptions.interval,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .leftJoin(projects, eq(subscriptions.projectId, projects.id))
      .where(eq(subscriptions.id, subscriptionId))
      .limit(1);

    return rows[0] ?? null;
  }

  async getSubscriptionByProviderId(providerSubscriptionId: string): Promise<AdminSubscriptionRecord | null> {
    const rows = await db
      .select({
        id: subscriptions.id,
        clientId: subscriptions.clientId,
        clientName: clients.name,
        projectId: subscriptions.projectId,
        projectName: projects.name,
        name: subscriptions.name,
        status: subscriptions.status,
        currency: subscriptions.currency,
        amount: subscriptions.amount,
        interval: subscriptions.interval,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .leftJoin(projects, eq(subscriptions.projectId, projects.id))
      .where(eq(subscriptions.providerSubscriptionId, providerSubscriptionId))
      .limit(1);

    return rows[0] ?? null;
  }

  async updateSubscription(
    subscriptionId: number,
    input: {
      status?: SubscriptionStatus;
      cancelAtPeriodEnd?: boolean;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      providerSubscriptionId?: string | null;
    },
  ): Promise<AdminSubscriptionRecord | null> {
    const updates: {
      status?: SubscriptionStatus;
      cancelAtPeriodEnd?: boolean;
      currentPeriodStart?: Date | null;
      currentPeriodEnd?: Date | null;
      providerSubscriptionId?: string | null;
      updatedAt: Date;
    } = {
      updatedAt: new Date(),
    };

    if (input.status !== undefined) updates.status = input.status;
    if (input.cancelAtPeriodEnd !== undefined) updates.cancelAtPeriodEnd = input.cancelAtPeriodEnd;
    if (input.currentPeriodStart !== undefined) updates.currentPeriodStart = input.currentPeriodStart;
    if (input.currentPeriodEnd !== undefined) updates.currentPeriodEnd = input.currentPeriodEnd;
    if (input.providerSubscriptionId !== undefined) updates.providerSubscriptionId = input.providerSubscriptionId;

    await db
      .update(subscriptions)
      .set(updates)
      .where(eq(subscriptions.id, subscriptionId));

    const rows = await db
      .select({
        id: subscriptions.id,
        clientId: subscriptions.clientId,
        clientName: clients.name,
        projectId: subscriptions.projectId,
        projectName: projects.name,
        name: subscriptions.name,
        status: subscriptions.status,
        currency: subscriptions.currency,
        amount: subscriptions.amount,
        interval: subscriptions.interval,
        provider: subscriptions.provider,
        providerSubscriptionId: subscriptions.providerSubscriptionId,
        currentPeriodStart: subscriptions.currentPeriodStart,
        currentPeriodEnd: subscriptions.currentPeriodEnd,
        cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
        createdAt: subscriptions.createdAt,
        updatedAt: subscriptions.updatedAt,
      })
      .from(subscriptions)
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .leftJoin(projects, eq(subscriptions.projectId, projects.id))
      .where(eq(subscriptions.id, subscriptionId));

    return rows[0] ?? null;
  }

  async createSubscriptionEvent(event: InsertSubscriptionStatusEvent): Promise<AdminSubscriptionEventRecord> {
    const [created] = await db.insert(subscriptionStatusEvents).values(event).returning();

    const rows = await db
      .select({
        id: subscriptionStatusEvents.id,
        subscriptionId: subscriptionStatusEvents.subscriptionId,
        subscriptionName: subscriptions.name,
        clientName: clients.name,
        fromStatus: subscriptionStatusEvents.fromStatus,
        toStatus: subscriptionStatusEvents.toStatus,
        source: subscriptionStatusEvents.source,
        note: subscriptionStatusEvents.note,
        createdAt: subscriptionStatusEvents.createdAt,
      })
      .from(subscriptionStatusEvents)
      .innerJoin(subscriptions, eq(subscriptionStatusEvents.subscriptionId, subscriptions.id))
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .where(eq(subscriptionStatusEvents.id, created.id))
      .limit(1);

    return rows[0];
  }

  async listSubscriptionEvents(limit = 30): Promise<AdminSubscriptionEventRecord[]> {
    return db
      .select({
        id: subscriptionStatusEvents.id,
        subscriptionId: subscriptionStatusEvents.subscriptionId,
        subscriptionName: subscriptions.name,
        clientName: clients.name,
        fromStatus: subscriptionStatusEvents.fromStatus,
        toStatus: subscriptionStatusEvents.toStatus,
        source: subscriptionStatusEvents.source,
        note: subscriptionStatusEvents.note,
        createdAt: subscriptionStatusEvents.createdAt,
      })
      .from(subscriptionStatusEvents)
      .innerJoin(subscriptions, eq(subscriptionStatusEvents.subscriptionId, subscriptions.id))
      .innerJoin(clients, eq(subscriptions.clientId, clients.id))
      .orderBy(desc(subscriptionStatusEvents.createdAt))
      .limit(limit);
  }

  async reconcileSubscriptionFromPayfast(input: {
    providerSubscriptionId: string;
    status: SubscriptionStatus;
    cancelAtPeriodEnd?: boolean;
    currentPeriodStart?: Date | null;
    currentPeriodEnd?: Date | null;
    note?: string;
  }): Promise<AdminSubscriptionRecord | null> {
    const existing = await this.getSubscriptionByProviderId(input.providerSubscriptionId);
    if (!existing) {
      return null;
    }

    const next = await this.updateSubscription(existing.id, {
      status: input.status,
      cancelAtPeriodEnd: input.cancelAtPeriodEnd,
      currentPeriodStart: input.currentPeriodStart,
      currentPeriodEnd: input.currentPeriodEnd,
      providerSubscriptionId: input.providerSubscriptionId,
    });

    if (next && existing.status !== next.status) {
      await this.createSubscriptionEvent({
        subscriptionId: existing.id,
        fromStatus: existing.status as SubscriptionStatus,
        toStatus: next.status as SubscriptionStatus,
        source: "payfast_itn",
        note: input.note ?? null,
      });
    }

    return next;
  }

  async updateInvoicePaymentDetails(
    invoiceId: number,
    details: {
      paymentProvider: PaymentProvider;
      paymentLink: string;
      providerInvoiceId: string;
      status?: InvoiceStatus;
    },
  ): Promise<AdminInvoiceRecord> {
    await db
      .update(invoices)
      .set({
        paymentProvider: details.paymentProvider,
        paymentLink: details.paymentLink,
        providerInvoiceId: details.providerInvoiceId,
        status: details.status ?? "sent",
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoiceId));

    const rows = await db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.primaryContactEmail,
        projectId: invoices.projectId,
        projectName: projects.name,
        quoteId: invoices.quoteId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        amountPaid: invoices.amountPaid,
        balanceDue: invoices.balanceDue,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        paymentProvider: invoices.paymentProvider,
        paymentLink: invoices.paymentLink,
        providerInvoiceId: invoices.providerInvoiceId,
        publicToken: invoices.publicToken,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.id, invoiceId));

    return rows[0];
  }

  async reconcileInvoiceFromPayfast(
    input: {
      publicToken: string;
      paymentStatus: string;
      providerPaymentId?: string;
      amountGross?: string;
    },
  ): Promise<{ invoice: AdminInvoiceRecord; statusChanged: boolean } | null> {
    const status = input.paymentStatus.toUpperCase();

    const existing = await db
      .select({
        id: invoices.id,
        totalAmount: invoices.totalAmount,
        status: invoices.status,
        amountPaid: invoices.amountPaid,
        providerInvoiceId: invoices.providerInvoiceId,
      })
      .from(invoices)
      .where(eq(invoices.publicToken, input.publicToken));

    const invoice = existing[0];

    if (!invoice) {
      return null;
    }

    const total = Number(invoice.totalAmount || "0");
    const paid = Number(input.amountGross || "0");
    const existingPaid = Number(invoice.amountPaid || "0");
    const amountPaid = Number.isFinite(paid) ? Math.max(paid, existingPaid, 0) : existingPaid;
    const balance = Math.max(total - amountPaid, 0);

    let nextStatus = invoice.status || "pending_payment";
    let paidAt: Date | null = null;

    if (status === "COMPLETE") {
      nextStatus = "paid";
      paidAt = new Date();
    } else if (status === "FAILED" && nextStatus !== "paid") {
      nextStatus = "failed";
    } else if (status === "CANCELLED" && nextStatus !== "paid") {
      nextStatus = "cancelled";
    }

    const statusChanged = nextStatus !== invoice.status;
    const isDuplicateReference =
      Boolean(input.providerPaymentId) &&
      Boolean(invoice.providerInvoiceId) &&
      input.providerPaymentId === invoice.providerInvoiceId;

    const alreadySettled = nextStatus === "paid" && invoice.status === "paid";

    if (alreadySettled && isDuplicateReference) {
      const rows = await db
        .select({
          id: invoices.id,
          clientId: invoices.clientId,
          clientName: clients.name,
          clientEmail: clients.primaryContactEmail,
          projectId: invoices.projectId,
          projectName: projects.name,
          quoteId: invoices.quoteId,
          invoiceNumber: invoices.invoiceNumber,
          status: invoices.status,
          currency: invoices.currency,
          subtotal: invoices.subtotal,
          taxAmount: invoices.taxAmount,
          totalAmount: invoices.totalAmount,
          amountPaid: invoices.amountPaid,
          balanceDue: invoices.balanceDue,
          dueAt: invoices.dueAt,
          paidAt: invoices.paidAt,
          paymentProvider: invoices.paymentProvider,
          paymentLink: invoices.paymentLink,
          providerInvoiceId: invoices.providerInvoiceId,
          publicToken: invoices.publicToken,
          createdAt: invoices.createdAt,
          updatedAt: invoices.updatedAt,
        })
        .from(invoices)
        .innerJoin(clients, eq(invoices.clientId, clients.id))
        .leftJoin(projects, eq(invoices.projectId, projects.id))
        .where(eq(invoices.id, invoice.id));

      return rows[0]
        ? { invoice: rows[0], statusChanged: false }
        : null;
    }

    await db
      .update(invoices)
      .set({
        status: nextStatus,
        amountPaid: amountPaid.toFixed(2),
        balanceDue: balance.toFixed(2),
        paidAt,
        paymentProvider: "payfast",
        providerInvoiceId: input.providerPaymentId || invoice.providerInvoiceId || undefined,
        updatedAt: new Date(),
      })
      .where(eq(invoices.id, invoice.id));

    const rows = await db
      .select({
        id: invoices.id,
        clientId: invoices.clientId,
        clientName: clients.name,
        clientEmail: clients.primaryContactEmail,
        projectId: invoices.projectId,
        projectName: projects.name,
        quoteId: invoices.quoteId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxAmount: invoices.taxAmount,
        totalAmount: invoices.totalAmount,
        amountPaid: invoices.amountPaid,
        balanceDue: invoices.balanceDue,
        dueAt: invoices.dueAt,
        paidAt: invoices.paidAt,
        paymentProvider: invoices.paymentProvider,
        paymentLink: invoices.paymentLink,
        providerInvoiceId: invoices.providerInvoiceId,
        publicToken: invoices.publicToken,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      })
      .from(invoices)
      .innerJoin(clients, eq(invoices.clientId, clients.id))
      .leftJoin(projects, eq(invoices.projectId, projects.id))
      .where(eq(invoices.id, invoice.id));

    return rows[0]
      ? { invoice: rows[0], statusChanged }
      : null;
  }
}

export const storage = new DatabaseStorage();
