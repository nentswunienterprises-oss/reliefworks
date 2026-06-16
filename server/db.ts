import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a Supabase database?",
  );
}

const client = postgres(process.env.DATABASE_URL, {
  prepare: false,
});

export const db = drizzle(client, { schema });

let commercialSchemaReadyPromise: Promise<void> | null = null;

export async function ensureCommercialSchemaCompatibility() {
  if (!commercialSchemaReadyPromise) {
    commercialSchemaReadyPromise = (async () => {
      await client.unsafe(`
        alter table quotes
        add column if not exists payment_terms_type varchar(40) not null default 'full_upfront'
      `);
      await client.unsafe(`
        alter table quotes
        add column if not exists deposit_percentage integer
      `);
      await client.unsafe(`
        alter table quotes
        add column if not exists payment_terms_note text
      `);
      await client.unsafe(`
        alter table invoices
        add column if not exists payment_terms_type varchar(40) not null default 'full_upfront'
      `);
      await client.unsafe(`
        alter table invoices
        add column if not exists deposit_percentage integer
      `);
      await client.unsafe(`
        alter table invoices
        add column if not exists payment_terms_note text
      `);
    })().catch((error) => {
      commercialSchemaReadyPromise = null;
      throw error;
    });
  }

  await commercialSchemaReadyPromise;
}
