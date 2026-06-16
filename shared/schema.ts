import {
  boolean,
  integer,
  numeric,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const pressureTypeOptions = ["friction", "limitation", "incoherence", "other"] as const;
export const clientStatusOptions = ["lead", "active", "paused", "archived"] as const;
export const projectStatusOptions = ["lead", "quoted", "active", "maintenance", "completed"] as const;
export const projectLifecycleStatusOptions = ["lead", "quoted", "approved", "invoiced"] as const;
export const billingModelOptions = ["one_off", "retainer", "hybrid"] as const;
export const supportedCurrencyOptions = ["ZAR", "USD", "GBP", "EUR"] as const;
export const quoteStatusOptions = ["draft", "sent", "approved", "expired"] as const;
export const invoiceStatusOptions = ["draft", "sent", "pending_payment", "paid", "failed", "cancelled"] as const;
export const subscriptionStatusOptions = ["pending", "active", "paused", "cancelled", "failed"] as const;
export const subscriptionIntervalOptions = ["month", "year"] as const;
export const paymentProviderOptions = ["payfast"] as const;
export const paymentTermsTypeOptions = ["full_upfront", "split_50_50", "milestone", "retainer", "custom"] as const;

export const pressureTypeSchema = z.enum(pressureTypeOptions);
export const clientStatusSchema = z.enum(clientStatusOptions);
export const projectStatusSchema = z.enum(projectStatusOptions);
export const projectLifecycleStatusSchema = z.enum(projectLifecycleStatusOptions);
export const billingModelSchema = z.enum(billingModelOptions);
export const supportedCurrencySchema = z.enum(supportedCurrencyOptions);
export const quoteStatusSchema = z.enum(quoteStatusOptions);
export const invoiceStatusSchema = z.enum(invoiceStatusOptions);
export const subscriptionStatusSchema = z.enum(subscriptionStatusOptions);
export const subscriptionIntervalSchema = z.enum(subscriptionIntervalOptions);
export const paymentProviderSchema = z.enum(paymentProviderOptions);
export const paymentTermsTypeSchema = z.enum(paymentTermsTypeOptions);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"),
  pressureType: varchar("pressure_type", { length: 50 }).notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  primaryContactName: text("primary_contact_name"),
  primaryContactEmail: text("primary_contact_email").notNull(),
  primaryContactPhone: text("primary_contact_phone"),
  companyName: text("company_name"),
  status: varchar("status", { length: 40 }).notNull().default("lead"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  name: text("name").notNull(),
  description: text("description"),
  status: varchar("status", { length: 40 }).notNull().default("lead"),
  billingModel: varchar("billing_model", { length: 40 }).notNull().default("hybrid"),
  currency: varchar("currency", { length: 10 }).notNull().default("ZAR"),
  oneOffAmount: numeric("one_off_amount", { precision: 12, scale: 2 }),
  monthlyRetainerAmount: numeric("monthly_retainer_amount", { precision: 12, scale: 2 }),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const projectStatusUpdates = pgTable("project_status_updates", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id),
  title: text("title").notNull(),
  summary: text("summary"),
  status: varchar("status", { length: 40 }).notNull().default("update"),
  visibility: varchar("visibility", { length: 20 }).notNull().default("client"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull().unique(),
  title: text("title").notNull(),
  scope: text("scope"),
  status: varchar("status", { length: 40 }).notNull().default("draft"),
  currency: varchar("currency", { length: 10 }).notNull().default("ZAR"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentTermsType: varchar("payment_terms_type", { length: 40 }).notNull().default("full_upfront"),
  depositPercentage: integer("deposit_percentage"),
  paymentTermsNote: text("payment_terms_note"),
  approvalToken: varchar("approval_token", { length: 120 }).unique(),
  approvedAt: timestamp("approved_at"),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const quoteLineItems = pgTable("quote_line_items", {
  id: serial("id").primaryKey(),
  quoteId: integer("quote_id")
    .notNull()
    .references(() => quotes.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  position: integer("position").notNull().default(0),
});

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  quoteId: integer("quote_id").references(() => quotes.id),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull().unique(),
  status: varchar("status", { length: 40 }).notNull().default("draft"),
  currency: varchar("currency", { length: 10 }).notNull().default("ZAR"),
  subtotal: numeric("subtotal", { precision: 12, scale: 2 }).notNull().default("0"),
  taxAmount: numeric("tax_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  totalAmount: numeric("total_amount", { precision: 12, scale: 2 }).notNull().default("0"),
  paymentTermsType: varchar("payment_terms_type", { length: 40 }).notNull().default("full_upfront"),
  depositPercentage: integer("deposit_percentage"),
  paymentTermsNote: text("payment_terms_note"),
  amountPaid: numeric("amount_paid", { precision: 12, scale: 2 }).notNull().default("0"),
  balanceDue: numeric("balance_due", { precision: 12, scale: 2 }).notNull().default("0"),
  dueAt: timestamp("due_at"),
  paidAt: timestamp("paid_at"),
  paymentProvider: varchar("payment_provider", { length: 40 }),
  paymentLink: text("payment_link"),
  providerInvoiceId: text("provider_invoice_id"),
  publicToken: varchar("public_token", { length: 120 }).unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const invoiceLineItems = pgTable("invoice_line_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id")
    .notNull()
    .references(() => invoices.id),
  description: text("description").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull().default("0"),
  position: integer("position").notNull().default(0),
});

export const subscriptions = pgTable("subscriptions", {
  id: serial("id").primaryKey(),
  clientId: integer("client_id")
    .notNull()
    .references(() => clients.id),
  projectId: integer("project_id").references(() => projects.id),
  name: text("name").notNull(),
  status: varchar("status", { length: 40 }).notNull().default("pending"),
  currency: varchar("currency", { length: 10 }).notNull().default("ZAR"),
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull().default("0"),
  interval: varchar("interval", { length: 20 }).notNull().default("month"),
  provider: varchar("provider", { length: 40 }).notNull().default("payfast"),
  providerSubscriptionId: text("provider_subscription_id"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const subscriptionStatusEvents = pgTable("subscription_status_events", {
  id: serial("id").primaryKey(),
  subscriptionId: integer("subscription_id")
    .notNull()
    .references(() => subscriptions.id),
  fromStatus: varchar("from_status", { length: 40 }),
  toStatus: varchar("to_status", { length: 40 }).notNull(),
  source: varchar("source", { length: 40 }).notNull().default("admin"),
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInquirySchema = createInsertSchema(inquiries).omit({ 
  id: true, 
  createdAt: true 
}).extend({
  pressureType: pressureTypeSchema,
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: clientStatusSchema.optional(),
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: projectStatusSchema.optional(),
  billingModel: billingModelSchema.optional(),
  currency: supportedCurrencySchema.optional(),
});

export const insertProjectStatusUpdateSchema = createInsertSchema(projectStatusUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: quoteStatusSchema.optional(),
  currency: supportedCurrencySchema.optional(),
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: invoiceStatusSchema.optional(),
  currency: supportedCurrencySchema.optional(),
  paymentProvider: paymentProviderSchema.nullable().optional(),
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  status: subscriptionStatusSchema.optional(),
  currency: supportedCurrencySchema.optional(),
  interval: subscriptionIntervalSchema.optional(),
  provider: paymentProviderSchema.optional(),
});

export const insertSubscriptionStatusEventSchema = createInsertSchema(subscriptionStatusEvents).omit({
  id: true,
  createdAt: true,
}).extend({
  fromStatus: subscriptionStatusSchema.nullable().optional(),
  toStatus: subscriptionStatusSchema,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type PressureType = z.infer<typeof pressureTypeSchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type ClientStatus = z.infer<typeof clientStatusSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type ProjectStatus = z.infer<typeof projectStatusSchema>;
export type ProjectLifecycleStatus = z.infer<typeof projectLifecycleStatusSchema>;
export type BillingModel = z.infer<typeof billingModelSchema>;
export type SupportedCurrency = z.infer<typeof supportedCurrencySchema>;
export type InsertProjectStatusUpdate = z.infer<typeof insertProjectStatusUpdateSchema>;
export type ProjectStatusUpdate = typeof projectStatusUpdates.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type QuoteStatus = z.infer<typeof quoteStatusSchema>;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InvoiceStatus = z.infer<typeof invoiceStatusSchema>;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type SubscriptionInterval = z.infer<typeof subscriptionIntervalSchema>;
export type PaymentProvider = z.infer<typeof paymentProviderSchema>;
export type PaymentTermsType = z.infer<typeof paymentTermsTypeSchema>;
export type InsertSubscriptionStatusEvent = z.infer<typeof insertSubscriptionStatusEventSchema>;
export type SubscriptionStatusEvent = typeof subscriptionStatusEvents.$inferSelect;
