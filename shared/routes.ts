import { z } from 'zod';
import {
  insertClientSchema,
  insertInvoiceSchema,
  insertInquirySchema,
  insertProjectSchema,
  insertQuoteSchema,
  insertSubscriptionSchema,
  inquiries,
} from './schema.ts';

const jsonDate = z.coerce.date();
const jsonDateNullable = jsonDate.nullable();

export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type InsertClient = z.infer<typeof insertClientSchema>;
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type InsertQuote = z.infer<typeof insertQuoteSchema>;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
export type InsertSubscription = z.infer<typeof insertSubscriptionSchema>;

export const adminSessionSchema = z.object({
  isAuthenticated: z.boolean(),
  user: z
    .object({
      email: z.string().email(),
      name: z.string(),
    })
    .nullable(),
});

export const adminLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminDashboardSummarySchema = z.object({
  totals: z.object({
    inquiries: z.number(),
    clients: z.number(),
    projects: z.number(),
    quotes: z.number(),
    invoices: z.number(),
    subscriptions: z.number(),
  }),
  recentInquiries: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      email: z.string().email(),
      company: z.string().nullable(),
      role: z.string().nullable(),
      pressureType: z.string(),
      message: z.string(),
      createdAt: jsonDateNullable,
    }),
  ),
});

export const adminClientSchema = z.object({
  id: z.number(),
  name: z.string(),
  primaryContactName: z.string().nullable(),
  primaryContactEmail: z.string().email(),
  primaryContactPhone: z.string().nullable(),
  companyName: z.string().nullable(),
  status: z.string(),
  notes: z.string().nullable(),
  createdAt: jsonDate,
  updatedAt: jsonDate,
});

export const adminProjectSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  name: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  billingModel: z.string(),
  currency: z.string(),
  oneOffAmount: z.string().nullable(),
  monthlyRetainerAmount: z.string().nullable(),
  startDate: jsonDateNullable,
  endDate: jsonDateNullable,
  createdAt: jsonDate,
  updatedAt: jsonDate,
});

export const adminQuoteSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  projectId: z.number().nullable(),
  projectName: z.string().nullable(),
  quoteNumber: z.string(),
  title: z.string(),
  scope: z.string().nullable(),
  status: z.string(),
  currency: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  totalAmount: z.string(),
  approvalToken: z.string().nullable(),
  approvedAt: jsonDateNullable,
  expiresAt: jsonDateNullable,
  createdAt: jsonDate,
  updatedAt: jsonDate,
});

export const adminCreateQuoteInputSchema = z.object({
  clientId: z.number(),
  projectId: z.number().nullable().optional(),
  title: z.string().min(1),
  scope: z.string().nullable().optional(),
  currency: z.string().min(3).max(10).default('ZAR'),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  expiresAt: z.coerce.date().nullable().optional(),
});

export const adminInvoiceSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  clientEmail: z.string().email(),
  projectId: z.number().nullable(),
  projectName: z.string().nullable(),
  quoteId: z.number().nullable(),
  invoiceNumber: z.string(),
  status: z.string(),
  currency: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  totalAmount: z.string(),
  amountPaid: z.string(),
  balanceDue: z.string(),
  dueAt: jsonDateNullable,
  paidAt: jsonDateNullable,
  paymentProvider: z.string().nullable(),
  paymentLink: z.string().nullable(),
  providerInvoiceId: z.string().nullable(),
  publicToken: z.string().nullable(),
  createdAt: jsonDate,
  updatedAt: jsonDate,
});

export const adminCreateInvoiceInputSchema = z.object({
  clientId: z.number(),
  projectId: z.number().nullable().optional(),
  quoteId: z.number().nullable().optional(),
  currency: z.string().min(3).max(10).default('ZAR'),
  subtotal: z.number().min(0),
  taxAmount: z.number().min(0).default(0),
  dueAt: z.coerce.date().nullable().optional(),
  createPaymentLink: z.boolean().default(true),
});

export const adminSubscriptionSchema = z.object({
  id: z.number(),
  clientId: z.number(),
  clientName: z.string(),
  projectId: z.number().nullable(),
  projectName: z.string().nullable(),
  name: z.string(),
  status: z.string(),
  currency: z.string(),
  amount: z.string(),
  interval: z.string(),
  provider: z.string(),
  providerSubscriptionId: z.string().nullable(),
  currentPeriodStart: jsonDateNullable,
  currentPeriodEnd: jsonDateNullable,
  cancelAtPeriodEnd: z.boolean(),
  createdAt: jsonDate,
  updatedAt: jsonDate,
});

export const adminUpdateSubscriptionInputSchema = z.object({
  status: z.string().optional(),
  cancelAtPeriodEnd: z.boolean().optional(),
  currentPeriodStart: z.coerce.date().nullable().optional(),
  currentPeriodEnd: z.coerce.date().nullable().optional(),
  providerSubscriptionId: z.string().nullable().optional(),
});

export const adminSubscriptionEventSchema = z.object({
  id: z.number(),
  subscriptionId: z.number(),
  subscriptionName: z.string(),
  clientName: z.string(),
  fromStatus: z.string().nullable(),
  toStatus: z.string(),
  source: z.string(),
  note: z.string().nullable(),
  createdAt: jsonDate,
});

export const publicQuoteSchema = z.object({
  id: z.number(),
  quoteNumber: z.string(),
  title: z.string(),
  scope: z.string().nullable(),
  status: z.string(),
  currency: z.string(),
  subtotal: z.string(),
  taxAmount: z.string(),
  totalAmount: z.string(),
  clientName: z.string(),
  expiresAt: jsonDateNullable,
  approvedAt: jsonDateNullable,
});

export const adminQuoteConversionResultSchema = z.object({
  project: adminProjectSchema,
  invoice: adminInvoiceSchema,
});

export type AdminSession = z.infer<typeof adminSessionSchema>;
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;
export type AdminDashboardSummary = z.infer<typeof adminDashboardSummarySchema>;
export type AdminClient = z.infer<typeof adminClientSchema>;
export type AdminProject = z.infer<typeof adminProjectSchema>;
export type AdminQuote = z.infer<typeof adminQuoteSchema>;
export type AdminCreateQuoteInput = z.infer<typeof adminCreateQuoteInputSchema>;
export type AdminInvoice = z.infer<typeof adminInvoiceSchema>;
export type AdminCreateInvoiceInput = z.infer<typeof adminCreateInvoiceInputSchema>;
export type AdminSubscription = z.infer<typeof adminSubscriptionSchema>;
export type AdminUpdateSubscriptionInput = z.infer<typeof adminUpdateSubscriptionInputSchema>;
export type AdminSubscriptionEvent = z.infer<typeof adminSubscriptionEventSchema>;
export type PublicQuote = z.infer<typeof publicQuoteSchema>;
export type AdminQuoteConversionResult = z.infer<typeof adminQuoteConversionResultSchema>;

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  admin: {
    session: {
      method: 'GET' as const,
      path: '/api/admin/session',
      responses: {
        200: adminSessionSchema,
      },
    },
    login: {
      method: 'POST' as const,
      path: '/api/admin/login',
      input: adminLoginSchema,
      responses: {
        200: adminSessionSchema,
        401: errorSchemas.validation,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/admin/logout',
      responses: {
        200: z.object({ success: z.literal(true) }),
      },
    },
    dashboardSummary: {
      method: 'GET' as const,
      path: '/api/admin/dashboard/summary',
      responses: {
        200: adminDashboardSummarySchema,
        401: errorSchemas.validation,
      },
    },
    clients: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/clients',
        responses: {
          200: z.array(adminClientSchema),
          401: errorSchemas.validation,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/clients',
        input: insertClientSchema,
        responses: {
          201: adminClientSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
        },
      },
    },
    projects: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/projects',
        responses: {
          200: z.array(adminProjectSchema),
          401: errorSchemas.validation,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/projects',
        input: insertProjectSchema,
        responses: {
          201: adminProjectSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
        },
      },
    },
    quotes: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/quotes',
        responses: {
          200: z.array(adminQuoteSchema),
          401: errorSchemas.validation,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/quotes',
        input: adminCreateQuoteInputSchema,
        responses: {
          201: adminQuoteSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
        },
      },
      convert: {
        method: 'POST' as const,
        path: '/api/admin/quotes/:quoteId/convert',
        responses: {
          200: adminQuoteConversionResultSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
          404: errorSchemas.validation,
        },
      },
    },
    invoices: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/invoices',
        responses: {
          200: z.array(adminInvoiceSchema),
          401: errorSchemas.validation,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/invoices',
        input: adminCreateInvoiceInputSchema,
        responses: {
          201: adminInvoiceSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
        },
      },
    },
    subscriptions: {
      list: {
        method: 'GET' as const,
        path: '/api/admin/subscriptions',
        responses: {
          200: z.array(adminSubscriptionSchema),
          401: errorSchemas.validation,
        },
      },
      create: {
        method: 'POST' as const,
        path: '/api/admin/subscriptions',
        input: insertSubscriptionSchema,
        responses: {
          201: adminSubscriptionSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
        },
      },
      update: {
        method: 'PATCH' as const,
        path: '/api/admin/subscriptions/:subscriptionId',
        input: adminUpdateSubscriptionInputSchema,
        responses: {
          200: adminSubscriptionSchema,
          400: errorSchemas.validation,
          401: errorSchemas.validation,
          404: errorSchemas.validation,
        },
      },
      events: {
        list: {
          method: 'GET' as const,
          path: '/api/admin/subscription-events',
          responses: {
            200: z.array(adminSubscriptionEventSchema),
            401: errorSchemas.validation,
          },
        },
      },
    },
  },
  inquiries: {
    create: {
      method: 'POST' as const,
      path: '/api/inquiries',
      input: insertInquirySchema,
      responses: {
        201: z.custom<typeof inquiries.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  public: {
    quoteByToken: {
      method: 'GET' as const,
      path: '/api/public/quotes/:approvalToken',
      responses: {
        200: publicQuoteSchema,
        404: errorSchemas.validation,
      },
    },
    approveQuote: {
      method: 'POST' as const,
      path: '/api/public/quotes/:approvalToken/approve',
      responses: {
        200: publicQuoteSchema,
        400: errorSchemas.validation,
        404: errorSchemas.validation,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
