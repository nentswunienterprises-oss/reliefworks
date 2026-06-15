import type { Express } from "express";
import type { RequestHandler } from "express";
import { randomUUID } from "crypto";
import {
  createPayfastPaymentUrl,
  isTrustedPayfastSource,
  verifyPayfastSignature,
} from "./payfast.ts";
import { clearAdminAuthCookie, setAdminAuthCookie } from "./admin-auth.ts";
import { sendTransactionalEmail } from "./email.ts";
import { storage } from "./storage.ts";
import { api } from "@shared/routes";
import { z } from "zod";

function generateQuoteNumber() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RW-Q-${stamp}-${random}`;
}

function generateApprovalToken() {
  return randomUUID().replace(/-/g, "");
}

function generateInvoiceNumber() {
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${String(now.getUTCMonth() + 1).padStart(2, "0")}${String(now.getUTCDate()).padStart(2, "0")}`;
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `RW-I-${stamp}-${random}`;
}

function generatePublicToken() {
  return randomUUID().replace(/-/g, "");
}

function getAdminCredentials() {
  return {
    email: process.env.ADMIN_EMAIL || "admin@reliefworks.local",
    password: process.env.ADMIN_PASSWORD || "change-me",
    name: process.env.ADMIN_NAME || "Relief Works Admin",
  };
}

const requireAdmin: RequestHandler = (req, res, next) => {
  if (!req.adminUser) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  next();
};

const payfastItnInputSchema = z.object({
  m_payment_id: z.string().min(1),
  payment_status: z.string().min(1),
  pf_payment_id: z.string().optional(),
  amount_gross: z.string().optional(),
  merchant_id: z.string().optional(),
  signature: z.string().optional(),
}).passthrough();

const payfastSubscriptionItnInputSchema = z.object({
  subscription_id: z.string().optional(),
  pf_subscription_id: z.string().optional(),
  payment_status: z.string().optional(),
  status: z.string().optional(),
  cancel_at_period_end: z.string().optional(),
  current_period_start: z.string().optional(),
  current_period_end: z.string().optional(),
  next_billing_date: z.string().optional(),
  merchant_id: z.string().optional(),
  signature: z.string().optional(),
}).passthrough();

function normalizeSubscriptionStatus(input: string | undefined) {
  const value = (input || "").toUpperCase();
  if (!value) return "pending";
  if (["ACTIVE", "COMPLETE", "PAID"].includes(value)) return "active";
  if (["CANCELLED", "CANCELED"].includes(value)) return "cancelled";
  if (["PAUSED", "SUSPENDED"].includes(value)) return "paused";
  if (["FAILED", "ERROR"].includes(value)) return "failed";
  return "pending";
}

export function registerRoutes(app: Express) {
  const sendEmailSafely = async (input: {
    to: string;
    subject: string;
    html: string;
    text: string;
  }) => {
    try {
      await sendTransactionalEmail(input);
    } catch (error) {
      console.error("Email send failed:", error);
    }
  };

  const toPublicQuote = (quote: Awaited<ReturnType<typeof storage.getQuoteById>>) => {
    if (!quote) {
      return null;
    }

    return {
      id: quote.id,
      quoteNumber: quote.quoteNumber,
      title: quote.title,
      scope: quote.scope,
      status: quote.status,
      currency: quote.currency,
      subtotal: quote.subtotal,
      taxAmount: quote.taxAmount,
      totalAmount: quote.totalAmount,
      clientName: quote.clientName,
      expiresAt: quote.expiresAt,
      approvedAt: quote.approvedAt,
    };
  };

  const attachPayfastLinkToInvoice = async (
    invoice: Awaited<ReturnType<typeof storage.createInvoice>>,
    amount: string,
  ) => {
    const isSandbox = process.env.PAYFAST_SANDBOX === "true";
    const payfastMerchantId = isSandbox
      ? process.env.PAYFAST_SANDBOX_MERCHANT_ID || process.env.PAYFAST_MERCHANT_ID
      : process.env.PAYFAST_MERCHANT_ID;
    const payfastMerchantKey = isSandbox
      ? process.env.PAYFAST_SANDBOX_MERCHANT_KEY || process.env.PAYFAST_MERCHANT_KEY
      : process.env.PAYFAST_MERCHANT_KEY;

    if (!payfastMerchantId || !payfastMerchantKey) {
      throw new Error("PAYFAST_MERCHANT_ID and PAYFAST_MERCHANT_KEY are required to generate payment links");
    }

    const payfastResult = createPayfastPaymentUrl(
      {
        merchantId: payfastMerchantId,
        merchantKey: payfastMerchantKey,
        passphrase: isSandbox
          ? process.env.PAYFAST_SANDBOX_PASSPHRASE || process.env.PAYFAST_PASSPHRASE
          : process.env.PAYFAST_PASSPHRASE,
        sandbox: isSandbox,
        returnUrl: isSandbox
          ? process.env.PAYFAST_SANDBOX_RETURN_URL || process.env.PAYFAST_RETURN_URL
          : process.env.PAYFAST_RETURN_URL,
        cancelUrl: isSandbox
          ? process.env.PAYFAST_SANDBOX_CANCEL_URL || process.env.PAYFAST_CANCEL_URL
          : process.env.PAYFAST_CANCEL_URL,
        notifyUrl: isSandbox
          ? process.env.PAYFAST_SANDBOX_NOTIFY_URL || process.env.PAYFAST_NOTIFY_URL
          : process.env.PAYFAST_NOTIFY_URL,
      },
      {
        invoiceNumber: invoice.invoiceNumber,
        invoiceToken: invoice.publicToken || generatePublicToken(),
        amount,
        itemName: `Relief Works Invoice ${invoice.invoiceNumber}`,
        itemDescription: `Invoice for client ${invoice.clientName}`,
        customerEmail: invoice.clientEmail,
      },
    );

    return storage.updateInvoicePaymentDetails(invoice.id, {
      paymentProvider: "payfast",
      paymentLink: payfastResult.paymentLink,
      providerInvoiceId: payfastResult.reference,
      status: "sent",
    });
  };

  const convertApprovedQuote = async (quoteId: number) => {
    const quote = await storage.getQuoteById(quoteId);
    if (!quote) {
      throw new Error("Quote not found");
    }

    if (quote.status !== "approved") {
      throw new Error("Quote must be approved before conversion");
    }

    let projectId = quote.projectId;

    if (!projectId) {
      const project = await storage.createProject({
        clientId: quote.clientId,
        name: quote.title,
        description: quote.scope,
        status: "active",
        billingModel: "one_off",
        currency: quote.currency,
        oneOffAmount: quote.totalAmount,
        monthlyRetainerAmount: null,
        startDate: null,
        endDate: null,
      });
      projectId = project.id;
    }

    let invoice = await storage.getInvoiceByQuoteId(quote.id);

    if (!invoice) {
      const subtotal = Number(quote.subtotal || "0");
      const taxAmount = Number(quote.taxAmount || "0");
      const totalAmount = Number(quote.totalAmount || "0");

      invoice = await storage.createInvoice({
        clientId: quote.clientId,
        projectId,
        quoteId: quote.id,
        invoiceNumber: generateInvoiceNumber(),
        status: "draft",
        currency: quote.currency,
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        amountPaid: "0.00",
        balanceDue: totalAmount.toFixed(2),
        dueAt: null,
        paidAt: null,
        paymentProvider: null,
        paymentLink: null,
        providerInvoiceId: null,
        publicToken: generatePublicToken(),
      });
    }

    if (!invoice.paymentLink) {
      invoice = await attachPayfastLinkToInvoice(invoice, invoice.totalAmount);
    }

    const project = await storage.listProjects().then((items) => items.find((item) => item.id === projectId));
    if (!project) {
      throw new Error("Project could not be loaded after conversion");
    }

    return { quote, project, invoice };
  };

  app.post("/api/payfast/itn", async (req, res) => {
    try {
      const input = payfastItnInputSchema.parse(req.body);

      const trustedIps = process.env.PAYFAST_TRUSTED_IPS;
      if (!isTrustedPayfastSource(req.ip, trustedIps)) {
        return res.status(403).send("untrusted source");
      }

      const signatureValid = verifyPayfastSignature({
        payload: Object.entries(input).reduce<Record<string, string | undefined>>((acc, [key, value]) => {
          acc[key] = typeof value === "string" ? value : undefined;
          return acc;
        }, {}),
        passphrase: process.env.PAYFAST_PASSPHRASE,
      });

      if (!signatureValid) {
        return res.status(400).send("invalid signature");
      }

      const expectedMerchantId = process.env.PAYFAST_MERCHANT_ID;
      if (expectedMerchantId && input.merchant_id && input.merchant_id !== expectedMerchantId) {
        return res.status(400).send("merchant mismatch");
      }

      const reconciled = await storage.reconcileInvoiceFromPayfast({
        publicToken: input.m_payment_id,
        paymentStatus: input.payment_status,
        providerPaymentId: input.pf_payment_id,
        amountGross: input.amount_gross,
      });

      if (!reconciled) {
        return res.status(404).send("invoice not found");
      }

      return res.status(200).send("ok");
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).send("invalid itn payload");
      }
      throw err;
    }
  });

  app.post("/api/payfast/subscriptions/itn", async (req, res) => {
    try {
      const input = payfastSubscriptionItnInputSchema.parse(req.body);

      const trustedIps = process.env.PAYFAST_TRUSTED_IPS;
      if (!isTrustedPayfastSource(req.ip, trustedIps)) {
        return res.status(403).send("untrusted source");
      }

      const signatureValid = verifyPayfastSignature({
        payload: Object.entries(input).reduce<Record<string, string | undefined>>((acc, [key, value]) => {
          acc[key] = typeof value === "string" ? value : undefined;
          return acc;
        }, {}),
        passphrase: process.env.PAYFAST_PASSPHRASE,
      });

      if (!signatureValid) {
        return res.status(400).send("invalid signature");
      }

      const expectedMerchantId = process.env.PAYFAST_MERCHANT_ID;
      if (expectedMerchantId && input.merchant_id && input.merchant_id !== expectedMerchantId) {
        return res.status(400).send("merchant mismatch");
      }

      const providerSubscriptionId = input.subscription_id || input.pf_subscription_id;
      if (!providerSubscriptionId) {
        return res.status(400).send("missing subscription id");
      }

      const status = normalizeSubscriptionStatus(input.payment_status || input.status);
      const cancelAtPeriodEnd = ["1", "true", "yes"].includes((input.cancel_at_period_end || "").toLowerCase());
      const currentPeriodStart = input.current_period_start ? new Date(input.current_period_start) : null;
      const currentPeriodEndRaw = input.current_period_end || input.next_billing_date;
      const currentPeriodEnd = currentPeriodEndRaw ? new Date(currentPeriodEndRaw) : null;

      const reconciled = await storage.reconcileSubscriptionFromPayfast({
        providerSubscriptionId,
        status,
        cancelAtPeriodEnd,
        currentPeriodStart: Number.isNaN(currentPeriodStart?.getTime()) ? null : currentPeriodStart,
        currentPeriodEnd: Number.isNaN(currentPeriodEnd?.getTime()) ? null : currentPeriodEnd,
        note: `PayFast status ${input.payment_status || input.status || "unknown"}`,
      });

      if (!reconciled) {
        return res.status(404).send("subscription not found");
      }

      return res.status(200).send("ok");
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).send("invalid itn payload");
      }
      throw err;
    }
  });

  app.get(api.admin.session.path, (req, res) => {
    res.json({
      isAuthenticated: Boolean(req.adminUser),
      user: req.adminUser ?? null,
    });
  });

  app.post(api.admin.login.path, async (req, res) => {
    const input = api.admin.login.input.parse(req.body);
    const adminCredentials = getAdminCredentials();

    if (
      input.email !== adminCredentials.email ||
      input.password !== adminCredentials.password
    ) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const adminUser = {
      email: adminCredentials.email,
      name: adminCredentials.name,
    };
    setAdminAuthCookie(res, adminUser);

    res.json({
      isAuthenticated: true,
      user: adminUser,
    });
  });

  app.post(api.admin.logout.path, (_req, res) => {
    clearAdminAuthCookie(res);
    res.json({ success: true });
  });

  app.get(api.admin.dashboardSummary.path, requireAdmin, async (_req, res) => {
    const summary = await storage.getAdminDashboardSummary();
    res.json(summary);
  });

  app.get(api.admin.clients.list.path, requireAdmin, async (_req, res) => {
    const clients = await storage.listClients();
    res.json(clients);
  });

  app.post(api.admin.clients.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.admin.projects.list.path, requireAdmin, async (_req, res) => {
    const projects = await storage.listProjects();
    res.json(projects);
  });

  app.post(api.admin.projects.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.projects.create.input.parse(req.body);
      const project = await storage.createProject(input);
      res.status(201).json(project);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.admin.quotes.list.path, requireAdmin, async (_req, res) => {
    const quotes = await storage.listQuotes();
    res.json(quotes);
  });

  app.post(api.admin.quotes.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.quotes.create.input.parse(req.body);
      const subtotal = Number(input.subtotal.toFixed(2));
      const taxAmount = Number(input.taxAmount.toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      const quote = await storage.createQuote({
        clientId: input.clientId,
        projectId: input.projectId ?? null,
        quoteNumber: generateQuoteNumber(),
        title: input.title,
        scope: input.scope ?? null,
        status: "draft",
        currency: input.currency.toUpperCase(),
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        approvalToken: generateApprovalToken(),
        approvedAt: null,
        expiresAt: input.expiresAt ?? null,
      });

      const client = (await storage.listClients()).find((item) => item.id === quote.clientId);
      if (client?.primaryContactEmail && quote.approvalToken) {
        const origin = process.env.PUBLIC_APP_ORIGIN || req.protocol + "://" + req.get("host");
        const approvalLink = `${origin}/quote/${quote.approvalToken}`;

        void sendEmailSafely({
          to: client.primaryContactEmail,
          subject: `Quote ${quote.quoteNumber} from Relief Works`,
          text: `Hello ${client.primaryContactName || client.name}, your quote ${quote.quoteNumber} is ready. Review and approve here: ${approvalLink}`,
          html: `<p>Hello ${client.primaryContactName || client.name},</p><p>Your quote <strong>${quote.quoteNumber}</strong> is ready.</p><p><a href="${approvalLink}">Review and approve your quote</a></p>`,
        });
      }

      res.status(201).json(quote);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.admin.invoices.list.path, requireAdmin, async (_req, res) => {
    const invoices = await storage.listInvoices();
    res.json(invoices);
  });

  app.get(api.admin.subscriptions.list.path, requireAdmin, async (_req, res) => {
    const records = await storage.listSubscriptions();
    res.json(records);
  });

  app.get(api.admin.subscriptions.events.list.path, requireAdmin, async (_req, res) => {
    const events = await storage.listSubscriptionEvents();
    res.json(events);
  });

  app.post(api.admin.subscriptions.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.subscriptions.create.input.parse(req.body);
      const record = await storage.createSubscription(input);
      await storage.createSubscriptionEvent({
        subscriptionId: record.id,
        fromStatus: null,
        toStatus: record.status,
        source: "admin",
        note: "Subscription created",
      });
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.patch(api.admin.subscriptions.update.path, requireAdmin, async (req, res) => {
    const parsedId = z.coerce.number().int().positive().safeParse(req.params.subscriptionId);
    if (!parsedId.success) {
      return res.status(400).json({ message: "Invalid subscription id", field: "subscriptionId" });
    }

    try {
      const previous = await storage.getSubscriptionById(parsedId.data);
      if (!previous) {
        return res.status(404).json({ message: "Subscription not found", field: "subscriptionId" });
      }

      const input = api.admin.subscriptions.update.input.parse(req.body);
      const record = await storage.updateSubscription(parsedId.data, {
        status: input.status,
        cancelAtPeriodEnd: input.cancelAtPeriodEnd,
        currentPeriodStart: input.currentPeriodStart,
        currentPeriodEnd: input.currentPeriodEnd,
        providerSubscriptionId: input.providerSubscriptionId,
      });

      if (!record) {
        return res.status(404).json({ message: "Subscription not found", field: "subscriptionId" });
      }

      if (previous.status !== record.status || previous.cancelAtPeriodEnd !== record.cancelAtPeriodEnd) {
        await storage.createSubscriptionEvent({
          subscriptionId: record.id,
          fromStatus: previous.status,
          toStatus: record.status,
          source: "admin",
          note: previous.cancelAtPeriodEnd !== record.cancelAtPeriodEnd
            ? `cancelAtPeriodEnd ${previous.cancelAtPeriodEnd} -> ${record.cancelAtPeriodEnd}`
            : null,
        });
      }

      return res.json(record);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.admin.invoices.create.path, requireAdmin, async (req, res) => {
    try {
      const input = api.admin.invoices.create.input.parse(req.body);
      const subtotal = Number(input.subtotal.toFixed(2));
      const taxAmount = Number(input.taxAmount.toFixed(2));
      const totalAmount = Number((subtotal + taxAmount).toFixed(2));

      let invoice = await storage.createInvoice({
        clientId: input.clientId,
        projectId: input.projectId ?? null,
        quoteId: input.quoteId ?? null,
        invoiceNumber: generateInvoiceNumber(),
        status: "draft",
        currency: input.currency.toUpperCase(),
        subtotal: subtotal.toFixed(2),
        taxAmount: taxAmount.toFixed(2),
        totalAmount: totalAmount.toFixed(2),
        amountPaid: "0.00",
        balanceDue: totalAmount.toFixed(2),
        dueAt: input.dueAt ?? null,
        paidAt: null,
        paymentProvider: null,
        paymentLink: null,
        providerInvoiceId: null,
        publicToken: generatePublicToken(),
      });

      if (input.createPaymentLink) {
        invoice = await attachPayfastLinkToInvoice(invoice, totalAmount.toFixed(2));
      }

      if (invoice.clientEmail) {
        const paymentCopy = invoice.paymentLink
          ? `Pay securely using this link: ${invoice.paymentLink}`
          : "You will receive payment instructions shortly.";
        void sendEmailSafely({
          to: invoice.clientEmail,
          subject: `Invoice ${invoice.invoiceNumber} from Relief Works`,
          text: `Your invoice ${invoice.invoiceNumber} for ${invoice.currency} ${invoice.totalAmount} is ready. ${paymentCopy}`,
          html: `<p>Your invoice <strong>${invoice.invoiceNumber}</strong> for <strong>${invoice.currency} ${invoice.totalAmount}</strong> is ready.</p>${invoice.paymentLink ? `<p><a href="${invoice.paymentLink}">Pay this invoice</a></p>` : ""}`,
        });
      }

      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.public.quoteByToken.path, async (req, res) => {
    const tokenParam = req.params.approvalToken;
    const approvalToken = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
    if (!approvalToken) {
      return res.status(404).json({ message: "Quote not found" });
    }

    const quote = await storage.getQuoteByApprovalToken(approvalToken);
    const publicQuote = toPublicQuote(quote);

    if (!publicQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    return res.json(publicQuote);
  });

  app.post(api.public.approveQuote.path, async (req, res) => {
    const tokenParam = req.params.approvalToken;
    const approvalToken = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
    if (!approvalToken) {
      return res.status(404).json({ message: "Quote not found" });
    }

    const existing = await storage.getQuoteByApprovalToken(approvalToken);
    if (!existing) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (existing.expiresAt && existing.expiresAt.getTime() < Date.now()) {
      return res.status(400).json({ message: "Quote has expired" });
    }

    const approved = await storage.approveQuoteByApprovalToken(approvalToken);
    const publicQuote = toPublicQuote(approved);

    if (!publicQuote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (approved) {
      try {
        const converted = await convertApprovedQuote(approved.id);
        void sendEmailSafely({
          to: converted.invoice.clientEmail,
          subject: `Invoice ${converted.invoice.invoiceNumber} created from approved quote`,
          text: `Your approved quote ${converted.quote.quoteNumber} has been converted to invoice ${converted.invoice.invoiceNumber}. Pay here: ${converted.invoice.paymentLink || "(payment link unavailable)"}`,
          html: `<p>Your approved quote <strong>${converted.quote.quoteNumber}</strong> has been converted to invoice <strong>${converted.invoice.invoiceNumber}</strong>.</p>${converted.invoice.paymentLink ? `<p><a href="${converted.invoice.paymentLink}">Pay now</a></p>` : ""}`,
        });
      } catch (error) {
        console.error("Auto conversion after approval failed:", error);
      }
    }

    return res.json(publicQuote);
  });

  app.post(api.admin.quotes.convert.path, requireAdmin, async (req, res) => {
    const parsed = z.coerce.number().int().positive().safeParse(req.params.quoteId);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid quote id", field: "quoteId" });
    }

    try {
      const converted = await convertApprovedQuote(parsed.data);

      void sendEmailSafely({
        to: converted.invoice.clientEmail,
        subject: `Invoice ${converted.invoice.invoiceNumber} created from approved quote`,
        text: `Your approved quote ${converted.quote.quoteNumber} has been converted to invoice ${converted.invoice.invoiceNumber}. Pay here: ${converted.invoice.paymentLink || "(payment link unavailable)"}`,
        html: `<p>Your approved quote <strong>${converted.quote.quoteNumber}</strong> has been converted to invoice <strong>${converted.invoice.invoiceNumber}</strong>.</p>${converted.invoice.paymentLink ? `<p><a href="${converted.invoice.paymentLink}">Pay now</a></p>` : ""}`,
      });

      return res.json({ project: converted.project, invoice: converted.invoice });
    } catch (error) {
      if (error instanceof Error && error.message === "Quote not found") {
        return res.status(404).json({ message: "Quote not found", field: "quoteId" });
      }
      if (error instanceof Error && error.message === "Quote must be approved before conversion") {
        return res.status(400).json({ message: error.message, field: "status" });
      }
      if (error instanceof Error && error.message === "Project could not be loaded after conversion") {
        return res.status(500).json({ message: error.message });
      }
      throw error;
    }
  });
}
