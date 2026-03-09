// Supabase Edge Function: Create Stripe Checkout Session
// Called after runner validates priority code and fills entry form

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://blackcountryrun.co.uk";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface EntryData {
  first_name: string;
  last_name: string;
  email: string;
  date_of_birth: string;
  gender: "M" | "F";
  club?: string;
  entry_type: "series" | "individual";
  races: string[];
  emergency_contact: string;
  emergency_phone: string;
  medical_info?: string;
  priority_code?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const entryData: EntryData = await req.json();

    // Validate priority code if provided
    if (entryData.priority_code) {
      const { data: codeData, error: codeError } = await supabaseAdmin
        .from("priority_codes")
        .select("*")
        .eq("code", entryData.priority_code)
        .single();

      if (codeError || !codeData) {
        return new Response(
          JSON.stringify({ error: "Invalid priority code" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (codeData.used) {
        return new Response(
          JSON.stringify({ error: "This priority code has already been used" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      if (new Date(codeData.expires_at) < new Date()) {
        return new Response(
          JSON.stringify({ error: "This priority code has expired" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    } else {
      // If no priority code, check if general entries are open
      const { data: settings } = await supabaseAdmin
        .from("entry_settings")
        .select("*")
        .eq("id", 1)
        .single();

      if (!settings?.general_entries_open) {
        // Check if priority window is open — if so, require a code
        if (settings?.priority_window_open) {
          return new Response(
            JSON.stringify({
              error:
                "A priority code is required during the priority entry window",
            }),
            {
              status: 400,
              headers: { ...corsHeaders, "Content-Type": "application/json" },
            }
          );
        }

        return new Response(
          JSON.stringify({ error: "Entries are not currently open" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }
    }

    // Check max entries haven't been reached
    const { count: currentEntries } = await supabaseAdmin
      .from("entries")
      .select("*", { count: "exact", head: true })
      .eq("entry_type", "series")
      .in("payment_status", ["paid", "pending"]);

    const { data: settings } = await supabaseAdmin
      .from("entry_settings")
      .select("max_series_entries")
      .eq("id", 1)
      .single();

    if (currentEntries && settings && currentEntries >= settings.max_series_entries) {
      return new Response(
        JSON.stringify({ error: "Sorry, series entries are now full" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Save entry with pending status
    const { data: entry, error: entryError } = await supabaseAdmin
      .from("entries")
      .insert([
        {
          first_name: entryData.first_name,
          last_name: entryData.last_name,
          email: entryData.email,
          date_of_birth: entryData.date_of_birth,
          gender: entryData.gender,
          club: entryData.club || null,
          entry_type: entryData.entry_type,
          races:
            entryData.entry_type === "series"
              ? ["Andy Holden 5K", "GWR 5K", "Dudley Zoo 5K"]
              : entryData.races,
          emergency_contact: entryData.emergency_contact,
          emergency_phone: entryData.emergency_phone,
          medical_info: entryData.medical_info || null,
          priority_code: entryData.priority_code || null,
          payment_status: "pending",
        },
      ])
      .select()
      .single();

    if (entryError) throw entryError;

    // Create Stripe Checkout Session
    const price = entryData.entry_type === "series" ? 3500 : 1500; // pence
    const description =
      entryData.entry_type === "series"
        ? "Black Country Run Series — Full Series Entry (All 3 Races + Interlocking Medal)"
        : `Black Country Run Series — Individual Race Entry`;

    const stripeResponse = await fetch(
      "https://api.stripe.com/v1/checkout/sessions",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${btoa(STRIPE_SECRET_KEY + ":")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          "payment_method_types[0]": "card",
          mode: "payment",
          "customer_email": entryData.email,
          "line_items[0][price_data][currency]": "gbp",
          "line_items[0][price_data][unit_amount]": String(price),
          "line_items[0][price_data][product_data][name]": description,
          "line_items[0][quantity]": "1",
          success_url: `${SITE_URL}/enter/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${SITE_URL}/enter?cancelled=true`,
          "metadata[entry_id]": entry.id,
          "metadata[entry_type]": entryData.entry_type,
          "metadata[priority_code]": entryData.priority_code || "",
          "metadata[runner_name]": `${entryData.first_name} ${entryData.last_name}`,
        }),
      }
    );

    if (!stripeResponse.ok) {
      const stripeError = await stripeResponse.json();
      console.error("Stripe error:", stripeError);
      throw new Error("Failed to create checkout session");
    }

    const session = await stripeResponse.json();

    // Update entry with Stripe session ID
    await supabaseAdmin
      .from("entries")
      .update({ stripe_session_id: session.id })
      .eq("id", entry.id);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutUrl: session.url,
        sessionId: session.id,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
