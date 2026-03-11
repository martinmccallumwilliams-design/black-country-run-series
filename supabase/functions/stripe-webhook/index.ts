// Supabase Edge Function: Stripe Webhook Handler
// Handles checkout.session.completed events
// Updates entry to 'paid', assigns race number, marks priority code as used, sends confirmation email

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const STRIPE_SECRET_KEY = Deno.env.get("STRIPE_SECRET_KEY")!;
const STRIPE_WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://blackcountryrun.co.uk";
const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "";

// Stripe webhook signature verification
async function verifyStripeSignature(
  payload: string,
  signature: string,
  secret: string
): Promise<boolean> {
  const parts = signature.split(",");
  const timestamp = parts.find((p) => p.startsWith("t="))?.split("=")[1];
  const v1Signature = parts.find((p) => p.startsWith("v1="))?.split("=")[1];

  if (!timestamp || !v1Signature) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(signedPayload)
  );
  const computedSig = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computedSig === v1Signature;
}

function getAgeGroup(dob: string, gender: string): string {
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;

  const g = gender === "M" ? "M" : "F";
  const prefix = g === "M" ? "M" : "F";
  const senior = g === "M" ? "MS" : "FS";

  if (age < 40) return senior;
  if (age < 45) return `${prefix}V40`;
  if (age < 50) return `${prefix}V45`;
  if (age < 55) return `${prefix}V50`;
  if (age < 60) return `${prefix}V55`;
  if (age < 65) return `${prefix}V60`;
  return `${prefix}V65+`;
}

function buildConfirmationEmail(
  firstName: string,
  lastName: string,
  entryType: string,
  races: string[],
  club: string | null,
  paymentId: string,
  raceNumber: number,
  ageGroup: string
): string {
  const raceRows = races
    .map((race) => {
      const raceInfo: Record<string, { date: string; location: string }> = {
        "Andy Holden 5K": {
          date: "Wed 8th July • 7:15pm",
          location: "Baggeridge Country Park",
        },
        "GWR 5K": {
          date: "Thu 23rd July • 7:15pm",
          location: "Railway Walk, Wombourne",
        },
        "Dudley Zoo 5K": {
          date: "Wed 29th July • 7:15pm",
          location: "Dudley Zoo and Castle",
        },
      };
      const info = raceInfo[race] || { date: "", location: "" };
      return `<tr>
      <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
        <span style="color: #dc2626; margin-right: 8px;">✓</span>
        <strong>${race}</strong> — ${info.date}<br/>
        <span style="color: #6b7280; font-size: 12px; margin-left: 20px;">${info.location}</span>
      </td>
    </tr>`;
    })
    .join("");

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <tr>
            <td style="text-align: center; padding: 32px 0;">
              <span style="font-weight: bold; font-size: 18px; color: white; letter-spacing: -0.5px;">BLACK COUNTRY RUN SERIES</span>
            </td>
          </tr>

          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); border-radius: 24px; padding: 48px 40px; border: 1px solid rgba(255,255,255,0.1);">

              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: rgba(34,197,94,0.2); color: #22c55e; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(34,197,94,0.3);">✅ Entry Confirmed</span>
              </div>

              <h1 style="color: white; font-size: 28px; font-weight: bold; text-align: center; margin: 0 0 16px 0; line-height: 1.2;">
                You're in, ${firstName}! 🎉
              </h1>

              <p style="color: #9ca3af; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                Your entry for the Black Country Run Series 2026 has been confirmed. See you at the start line!
              </p>

              <!-- Race Number -->
              <div style="background-color: rgba(155,28,28,0.1); border: 2px solid rgba(155,28,28,0.4); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <div style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 8px;">Your Race Number</div>
                <div style="color: white; font-size: 48px; font-weight: bold; font-family: 'Courier New', monospace; line-height: 1;">${raceNumber}</div>
                <div style="color: #6b7280; font-size: 12px; margin-top: 8px;">Age Group: <strong style="color: #9ca3af;">${ageGroup}</strong></div>
              </div>

              <!-- Entry Details -->
              <div style="background-color: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 1px solid rgba(255,255,255,0.08);">
                <h3 style="color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Your Entry Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px; width: 120px;">Runner</td>
                    <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: bold;">${firstName} ${lastName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Entry Type</td>
                    <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: bold;">${
                      entryType === "series" ? "Full Series (All 3 Races)" : "Individual"
                    }</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Age Group</td>
                    <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: bold;">${ageGroup}</td>
                  </tr>
                  ${
                    club
                      ? `<tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Club</td>
                    <td style="padding: 6px 0; color: white; font-size: 13px; font-weight: bold;">${club}</td>
                  </tr>`
                      : ""
                  }
                  <tr>
                    <td style="padding: 6px 0; color: #6b7280; font-size: 13px;">Payment Ref</td>
                    <td style="padding: 6px 0; color: #9ca3af; font-size: 11px; font-family: monospace;">${paymentId}</td>
                  </tr>
                </table>
              </div>

              <!-- Races -->
              <div style="background-color: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.08);">
                <h3 style="color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Your Races</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  ${raceRows}
                </table>
              </div>

              <!-- What to Know -->
              <div style="background-color: rgba(155,28,28,0.1); border: 1px solid rgba(155,28,28,0.2); border-radius: 16px; padding: 24px; margin-bottom: 32px;">
                <h3 style="color: #dc2626; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">What happens next?</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr><td style="padding: 4px 0; color: #d1d5db; font-size: 13px;">• Your race number is <strong style="color: white;">${raceNumber}</strong> — save this email!</td></tr>
                  <tr><td style="padding: 4px 0; color: #d1d5db; font-size: 13px;">• Course maps and race day info will be emailed before each race</td></tr>
                  <tr><td style="padding: 4px 0; color: #d1d5db; font-size: 13px;">• Arrive at least 45 minutes before your race</td></tr>
                  <tr><td style="padding: 4px 0; color: #d1d5db; font-size: 13px;">• Bring your race number and safety pins on race day</td></tr>
                </table>
              </div>

              <div style="text-align: center;">
                <a href="${SITE_URL}" style="display: inline-block; background: linear-gradient(135deg, #9b1c1c, #dc2626); color: white; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none;">
                  Visit the Website
                </a>
              </div>
            </td>
          </tr>

          <tr>
            <td style="text-align: center; padding: 40px 0 0 0;">
              <p style="color: #374151; font-size: 11px; margin: 0 0 8px 0;">Organised by Tipton Harriers</p>
              <p style="color: #1f2937; font-size: 10px; margin: 0; text-transform: uppercase; letter-spacing: 3px;">
                Three Evening Races · One Summer · One Medal
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "*" } });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    // Verify webhook signature
    if (signature && STRIPE_WEBHOOK_SECRET) {
      const isValid = await verifyStripeSignature(
        body,
        signature,
        STRIPE_WEBHOOK_SECRET
      );
      if (!isValid) {
        console.error("Invalid Stripe signature");
        return new Response("Invalid signature", { status: 400 });
      }
    }

    const event = JSON.parse(body);

    if (event.type !== "checkout.session.completed") {
      return new Response(JSON.stringify({ received: true }), { status: 200 });
    }

    const session = event.data.object;
    const entryId = session.metadata?.entry_id;
    const priorityCode = session.metadata?.priority_code;
    const paymentIntent = session.payment_intent;

    if (!entryId) {
      console.error("No entry_id in session metadata");
      return new Response("Missing entry_id", { status: 400 });
    }

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // 1. Update entry to paid
    const { data: entry, error: updateError } = await supabaseAdmin
      .from("entries")
      .update({
        payment_status: "paid",
        payment_id: paymentIntent,
        stripe_session_id: session.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", entryId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating entry:", updateError);
      throw updateError;
    }

    // 2. Assign race number via atomic DB function
    const { data: raceNumber, error: raceNumError } = await supabaseAdmin
      .rpc("assign_race_number", { entry_uuid: entryId });

    if (raceNumError) {
      console.error("Error assigning race number:", raceNumError);
      // Non-fatal — admin can assign manually
    }

    const assignedNumber = raceNumber || 0;

    // 3. Mark priority code as used
    if (priorityCode) {
      await supabaseAdmin
        .from("priority_codes")
        .update({
          used: true,
          used_at: new Date().toISOString(),
          entry_id: entryId,
        })
        .eq("code", priorityCode);
    }

    // 4. Send confirmation email with race number + age group
    if (entry && RESEND_API_KEY) {
      const ageGroup = getAgeGroup(entry.date_of_birth, entry.gender);

      const emailHtml = buildConfirmationEmail(
        entry.first_name,
        entry.last_name,
        entry.entry_type,
        entry.races,
        entry.club,
        paymentIntent || session.id,
        assignedNumber,
        ageGroup
      );

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Black Country Run Series <noreply@blackcountryrun.co.uk>",
          to: [entry.email],
          cc: ADMIN_EMAIL ? [ADMIN_EMAIL] : [],
          subject: `Entry confirmed! You're number ${assignedNumber}, ${entry.first_name} 🎉`,
          html: emailHtml,
        }),
      });

      if (!emailResponse.ok) {
        const errData = await emailResponse.json();
        console.error("Confirmation email failed:", errData);
      } else {
        console.log(`Confirmation email sent to ${entry.email} — race number ${assignedNumber}`);
      }
    }

    console.log(`✅ Entry ${entryId} paid. Race number: ${assignedNumber}. Payment: ${paymentIntent}`);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Webhook error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }
});
