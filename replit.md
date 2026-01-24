# Relief Works Technologies

## Overview

Relief Works is a premium consultancy website for a company that positions itself as a "pressure-removal" service. The application is a marketing and lead generation platform built with a modern React frontend and Express.js backend. The core functionality allows potential clients to self-diagnose their business challenges across three categories (Friction, Limitation, Incoherence) and submit inquiry forms for consultation.

The site features three main pages: Manifesto (brand philosophy), Services (the three forms of relief offered), and Diagnosis (client intake form). The design aesthetic is minimal, dark-themed, and premium—emphasizing clarity and calm as core brand values.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack React Query for server state
- **Styling**: Tailwind CSS with CSS custom properties for theming
- **UI Components**: shadcn/ui component library (New York style variant)
- **Animations**: Framer Motion for page transitions and scroll animations
- **Icons**: Lucide React
- **Typography**: DM Sans (body) and Libre Baskerville (display/headings)

The frontend follows a component-based architecture with pages in `client/src/pages/`, reusable components in `client/src/components/`, and UI primitives from shadcn/ui in `client/src/components/ui/`.

### Backend Architecture
- **Runtime**: Node.js with Express 5
- **Language**: TypeScript compiled with tsx
- **API Pattern**: RESTful endpoints defined in `shared/routes.ts` with Zod schema validation
- **Build**: esbuild for server bundling, Vite for client bundling

The server uses a clean separation between routing (`server/routes.ts`), storage abstraction (`server/storage.ts`), and database connection (`server/db.ts`).

### Data Layer
- **ORM**: Drizzle ORM with drizzle-zod for schema-to-validation integration
- **Database**: PostgreSQL (connection via `DATABASE_URL` environment variable)
- **Schema Location**: `shared/schema.ts` (shared between client and server)
- **Migrations**: Drizzle Kit with migrations output to `./migrations`

The current schema contains a single `inquiries` table for storing client diagnosis form submissions.

### Shared Code
The `shared/` directory contains code used by both frontend and backend:
- `schema.ts`: Database schema definitions and Zod validation schemas
- `routes.ts`: API route definitions with input/output types

This pattern ensures type safety across the full stack and eliminates API contract drift.

## External Dependencies

### Database
- **PostgreSQL**: Primary database, configured via `DATABASE_URL` environment variable
- **connect-pg-simple**: Session storage for PostgreSQL (available but not currently active)

### Development Tools
- **Vite**: Frontend development server with HMR
- **Drizzle Kit**: Database migration tool (`npm run db:push` to sync schema)
- **Replit Plugins**: Runtime error overlay, cartographer, and dev banner for Replit environment

### Third-Party UI Libraries
- **Radix UI**: Headless component primitives (dialogs, dropdowns, forms, etc.)
- **Embla Carousel**: Carousel functionality
- **cmdk**: Command palette component
- **react-day-picker**: Calendar/date picker
- **react-hook-form**: Form state management with Zod resolver
- **vaul**: Drawer component
- **recharts**: Charting library (available for future data visualization)

### Build & Runtime
- **tsx**: TypeScript execution for development
- **esbuild**: Production server bundling
- **PostCSS + Autoprefixer**: CSS processing pipeline