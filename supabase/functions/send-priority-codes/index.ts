// Supabase Edge Function: Generate priority codes and send emails to all registrants
// Called from the Admin Dashboard

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const SITE_URL = Deno.env.get("SITE_URL") || "https://blackcountryrun.co.uk";
const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Generate a random priority code: BCR-XXXX-XXXX
function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I,O,0,1 to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () =>
      chars[Math.floor(Math.random() * chars.length)]
    ).join("");
  return `BCR-${segment()}-${segment()}`;
}

function buildPriorityEmail(
  firstName: string,
  code: string,
  expiresAt: string
): string {
  const entryUrl = `${SITE_URL}/enter?code=${code}`;
  const expiryDate = new Date(expiresAt);
  const expiryFormatted = expiryDate.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

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
          
          <!-- Header -->
          <tr>
            <td style="text-align: center; padding: 32px 0;">
              <span style="font-weight: bold; font-size: 18px; color: white; letter-spacing: -0.5px;">BLACK COUNTRY RUN SERIES</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); border-radius: 24px; padding: 48px 40px; border: 1px solid rgba(255,255,255,0.1);">
              
              <!-- Urgent Badge -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: rgba(155,28,28,0.2); color: #dc2626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(155,28,28,0.3);">⏰ 48-Hour Priority Window</span>
              </div>

              <h1 style="color: white; font-size: 28px; font-weight: bold; text-align: center; margin: 0 0 16px 0; line-height: 1.2;">
                ${firstName}, your priority entry is ready! 🏃
              </h1>
              
              <p style="color: #9ca3af; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                As a registered interest holder, you have <strong style="color: white;">exclusive 48-hour early access</strong> to secure your place in the Black Country Run Series 2026.
              </p>

              <!-- Priority Code Box -->
              <div style="background-color: rgba(155,28,28,0.1); border: 2px solid rgba(155,28,28,0.3); border-radius: 16px; padding: 24px; text-align: center; margin-bottom: 32px;">
                <div style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 12px;">Your Priority Code</div>
                <div style="color: white; font-size: 32px; font-weight: bold; letter-spacing: 4px; font-family: 'Courier New', monospace; margin-bottom: 12px;">${code}</div>
                <div style="color: #dc2626; font-size: 12px; font-weight: bold;">Expires: ${expiryFormatted}</div>
              </div>

              <!-- What's Included -->
              <div style="background-color: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.08);">
                <h3 style="color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">Full Series Entry — £35 (Early Bird)</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 6px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Andy Holden 5K</strong> — Wed 8th July
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>GWR 5K</strong> — Thu 23rd July
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Dudley Zoo 5K</strong> — Wed 29th July
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Complete Interlocking Medal</strong>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Guaranteed entry</strong> to all 3 races
                    </td>
                  </tr>
                </table>
              </div>

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${entryUrl}" style="display: inline-block; background: linear-gradient(135deg, #9b1c1c, #dc2626); color: white; font-weight: bold; font-size: 16px; padding: 18px 40px; border-radius: 14px; text-decoration: none; letter-spacing: 0.5px;">
                  Enter Now — £35
                </a>
              </div>

              <p style="color: #6b7280; font-size: 12px; text-align: center; margin: 0; line-height: 1.5;">
                Or visit <a href="${SITE_URL}/enter" style="color: #dc2626;">${SITE_URL}/enter</a> and enter code <strong style="color: #9ca3af;">${code}</strong>
              </p>
            </td>
          </tr>

          <!-- Important Note -->
          <tr>
            <td style="padding: 24px 0;">
              <div style="background-color: #1a1a1a; border-radius: 16px; padding: 20px; border: 1px solid rgba(255,255,255,0.08); text-align: center;">
                <p style="color: #9ca3af; font-size: 13px; margin: 0; line-height: 1.6;">
                  <strong style="color: white;">Places are limited to 350</strong><br/>
                  After 48 hours, any remaining entries will be opened to the general public. Don't miss your guaranteed spot!
                </p>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 20px 0 0 0;">
              <p style="color: #374151; font-size: 11px; margin: 0 0 8px 0;">
                Organised by Tipton Harriers
              </p>
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
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create admin client
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { action, priorityHours = 48 } = await req.json();

    if (action === "generate") {
      // Fetch all registrations that haven't been sent a priority code yet
      const { data: registrations, error: fetchError } = await supabaseAdmin
        .from("registrations")
        .select("id, first_name, email")
        .eq("priority_code_sent", false);

      if (fetchError) throw fetchError;
      if (!registrations || registrations.length === 0) {
        return new Response(
          JSON.stringify({
            success: true,
            message: "No new registrations to process",
            count: 0,
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const expiresAt = new Date(
        Date.now() + priorityHours * 60 * 60 * 1000
      ).toISOString();

      // Generate codes for each registration
      const codes: Array<{
        registration_id: string;
        code: string;
        email: string;
        first_name: string;
        expires_at: string;
      }> = [];

      const usedCodes = new Set<string>();
      for (const reg of registrations) {
        let code: string;
        do {
          code = generateCode();
        } while (usedCodes.has(code));
        usedCodes.add(code);

        codes.push({
          registration_id: reg.id,
          code,
          email: reg.email,
          first_name: reg.first_name,
          expires_at: expiresAt,
        });
      }

      // Insert all codes
      const { error: insertError } = await supabaseAdmin
        .from("priority_codes")
        .insert(codes);

      if (insertError) throw insertError;

      // Update entry_settings with the priority window
      await supabaseAdmin
        .from("entry_settings")
        .update({
          priority_window_open: true,
          priority_window_start: new Date().toISOString(),
          priority_window_end: expiresAt,
        })
        .eq("id", 1);

      // Send emails in batches of 10 to avoid rate limits
      let sentCount = 0;
      let failedCount = 0;
      const batchSize = 10;

      for (let i = 0; i < codes.length; i += batchSize) {
        const batch = codes.slice(i, i + batchSize);

        const emailPromises = batch.map(async (item) => {
          try {
            const emailResponse = await fetch(
              "https://api.resend.com/emails",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                  from: "Black Country Run Series <noreply@blackcountryrun.co.uk>",
                  to: [item.email],
                  subject: `${item.first_name}, your priority entry code is ready! 🏃`,
                  html: buildPriorityEmail(
                    item.first_name,
                    item.code,
                    item.expires_at
                  ),
                }),
              }
            );

            if (emailResponse.ok) {
              // Mark registration as sent
              await supabaseAdmin
                .from("registrations")
                .update({
                  priority_code_sent: true,
                  priority_code_sent_at: new Date().toISOString(),
                })
                .eq("id", item.registration_id);
              sentCount++;
            } else {
              const errData = await emailResponse.json();
              console.error(`Email failed for ${item.email}:`, errData);
              failedCount++;
            }
          } catch (emailErr) {
            console.error(`Email error for ${item.email}:`, emailErr);
            failedCount++;
          }
        });

        await Promise.all(emailPromises);

        // Rate limit pause between batches
        if (i + batchSize < codes.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Notify admin
      if (ADMIN_EMAIL) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Black Country Run Series <noreply@blackcountryrun.co.uk>",
            to: [ADMIN_EMAIL],
            subject: `✅ Priority codes sent to ${sentCount} runners`,
            html: `<h2>Priority Codes Sent</h2>
              <p><strong>${sentCount}</strong> emails sent successfully.</p>
              <p><strong>${failedCount}</strong> emails failed.</p>
              <p>Priority window expires: <strong>${expiresAt}</strong></p>
              <p>Total codes generated: ${codes.length}</p>`,
          }),
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          generated: codes.length,
          sent: sentCount,
          failed: failedCount,
          expiresAt,
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Action: resend a single code
    if (action === "resend") {
      const { registrationId } = await req.json();

      const { data: codeData, error: codeError } = await supabaseAdmin
        .from("priority_codes")
        .select("*")
        .eq("registration_id", registrationId)
        .single();

      if (codeError || !codeData) {
        return new Response(
          JSON.stringify({ error: "Code not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      const emailResponse = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: "Black Country Run Series <noreply@blackcountryrun.co.uk>",
          to: [codeData.email],
          subject: `${codeData.first_name}, here's your priority code again 🏃`,
          html: buildPriorityEmail(
            codeData.first_name,
            codeData.code,
            codeData.expires_at
          ),
        }),
      });

      return new Response(
        JSON.stringify({ success: emailResponse.ok }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Invalid action. Use 'generate' or 'resend'." }),
      {
        status: 400,
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
