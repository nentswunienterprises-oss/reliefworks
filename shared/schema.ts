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

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  company: text("company"),
  role: text("role"),
  pressureType: varchar("pressure_type", { length: 50 }).notNull(), // Friction, Limitation, Incoherence, Other
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
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertProjectStatusUpdateSchema = createInsertSchema(projectStatusUpdates).omit({
  id: true,
  createdAt: true,
});

export const insertQuoteSchema = createInsertSchema(quotes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertQuoteLineItemSchema = createInsertSchema(quoteLineItems).omit({
  id: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertInvoiceLineItemSchema = createInsertSchema(invoiceLineItems).omit({
  id: true,
});

export const insertSubscriptionSchema = createInsertSchema(subscriptions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSubscriptionStatusEventSchema = createInsertSchema(subscriptionStatusEvents).omit({
  id: true,
  createdAt: true,
});

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projects.$inferSelect;
export type InsertProjectStatusUpdate = z.infer<typeof insertProjectStatusUpdateSchema>;
export type ProjectStatusUpdate = typeof projectStatusUpdates.$inferSelect;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type Quote = typeof quotes.$inferSelect;
export type InsertQuoteLineItem = z.infer<typeof insertQuoteLineItemSchema>;
export type QuoteLineItem = typeof quoteLineItems.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoiceLineItem = z.infer<typeof insertInvoiceLineItemSchema>;
export type InvoiceLineItem = typeof invoiceLineItems.$inferSelect;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;
export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscriptionStatusEvent = z.infer<typeof insertSubscriptionStatusEventSchema>;
export type SubscriptionStatusEvent = typeof subscriptionStatusEvents.$inferSelect;
