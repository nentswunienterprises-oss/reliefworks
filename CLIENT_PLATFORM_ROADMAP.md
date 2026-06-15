# Relief Works Client Platform Roadmap

## Product Direction

Relief Works should evolve from a lead-generation site into a premium client operations platform with five connected layers:

1. Lead capture and qualification
2. Client and project management
3. Quotations with approval links
4. Invoicing and subscription billing
5. Client-facing delivery and progress tracking

## Payment Recommendation

Recommended default: PayFast.

Why PayFast is the better primary choice for this build:

- Native South African payment fit with trusted local familiarity
- Strong hosted checkout flow for fast payment collection
- Practical business setup for invoicing and one-off project billing
- Suitable webhook/IPN model for reconciliation workflows
- Good fit for premium client-facing payment experiences

Paystack can remain an optional future integration if needed, but the primary engineering path should be PayFast-first.

## Core Modules

### 1. Leads

- Inquiry capture
- Qualification notes
- Convert lead to client

### 2. Clients

- Contact information
- Company profile
- Internal notes
- Billing status overview

### 3. Projects

- Project status
- Scope summary
- One-off build fee
- Monthly maintenance fee
- Client-visible progress updates

### 4. Quotations

- Line items
- Scope and terms
- Approval link
- Expiry date
- Convert approved quote into project and invoice

### 5. Invoices

- Draft, sent, paid, overdue states
- Hosted payment link
- Manual or webhook-synced payment reconciliation
- Email delivery and reminders

### 6. Subscriptions

- Monthly maintenance billing
- Start and cancel controls
- Provider subscription reference
- Client-facing billing status

### 7. Client Portal

- View quotes, invoices, and payment links
- Track project status and updates
- Download records
- Professional branded experience

## Suggested Delivery Phases

### Phase 1: Platform Backbone

- Add CRM and billing schema
- Add secure admin authentication
- Add admin dashboard shell
- Add client, project, quote, invoice, subscription entities

### Phase 2: Quote to Cash Flow

- Build quote creation UI
- Build approval links
- Convert approved quote into project and invoice
- Add PayFast payment link generation and hosted payment collection

### Phase 3: Recurring Billing

- Create subscription plans for maintenance retainers
- Sync recurring billing state from PayFast notifications/webhooks
- Surface billing health in admin dashboard

### Phase 4: Premium Client Experience

- Client login or magic-link access
- Project tracker timeline
- Files, notes, milestones, and approvals
- Branded transactional emails

## First Build Slice

The first implementation slice should focus on:

1. Admin authentication
2. Clients
3. Projects
4. Quotes with line items
5. Invoices with line items
6. PayFast integration scaffolding

That is the smallest slice that turns Relief Works into a serious internal operating system rather than a brochure site.

## Key Integrations

- PayFast: hosted checkout links, payment notifications, recurring billing support
- Resend or Postmark: transactional emails
- Supabase or PostgreSQL: application data storage

## Experience Standard

The product should feel:

- premium
- sparse and clear
- operationally serious
- client-safe
- brand-consistent with Relief Works

This means the admin and client portal should avoid clutter, expose only key states, and keep every screen tightly tied to business action.