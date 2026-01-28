import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { z } from "https://esm.sh/zod@3.24.2";

// Define validation schema (matches your shared schema)
const insertInquirySchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  company: z.string().optional(),
  role: z.string().optional(),
  pressureType: z.enum(["Friction", "Limitation", "Incoherence", "Other"]),
  message: z.string().min(1, "Message is required"),
});

type InsertInquiry = z.infer<typeof insertInquirySchema>;

export async function handler(req: Request) {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ message: "Method not allowed" }), {
      status: 405,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  try {
    // Parse request body
    const body = await req.json();

    // Validate input
    const data = insertInquirySchema.parse(body);

    // Create Supabase client (uses service role key from env)
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    // Insert into database
    const { data: inquiry, error } = await supabase
      .from("inquiries")
      .insert([
        {
          name: data.name,
          email: data.email,
          company: data.company || null,
          role: data.role || null,
          pressure_type: data.pressureType,
          message: data.message,
        },
      ])
      .select();

    if (error) {
      console.error("Database error:", error);
      return new Response(
        JSON.stringify({
          message: "Failed to save inquiry",
          error: error.message,
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Success response
    return new Response(JSON.stringify(inquiry[0]), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          message: error.errors[0].message,
          field: error.errors[0].path.join("."),
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    console.error("Error:", error);
    return new Response(
      JSON.stringify({ message: "Internal server error" }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  }
}
