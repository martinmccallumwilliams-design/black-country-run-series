// Supabase Edge Function: Send branded confirmation email via Resend
// Triggered from frontend after successful registration

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY")!;
const ADMIN_EMAIL = Deno.env.get("ADMIN_NOTIFICATION_EMAIL") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationData {
  first_name: string;
  email: string;
  club?: string;
  races_interested: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { record }: { record: RegistrationData } = await req.json();

    const { first_name, email, club, races_interested } = record;

    // Build the races list for the email
    const racesList = (races_interested || [])
      .map((race: string) => `<li style="padding: 4px 0;">${race}</li>`)
      .join("");

    // Send confirmation email to the registrant
    const emailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "Black Country Run Series <noreply@blackcountryrun.co.uk>",
        to: [email],
        cc: ADMIN_EMAIL ? [ADMIN_EMAIL] : [],
        subject: `You're on the priority list, ${first_name}! 🏃`,
        html: `
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
              <div style="display: inline-block; background-color: #15803d; width: 40px; height: 40px; line-height: 40px; text-align: center; font-weight: bold; font-size: 20px; color: white; border-radius: 4px;">B</div>
              <span style="font-weight: bold; font-size: 18px; color: white; margin-left: 8px; letter-spacing: -0.5px;">BLACK COUNTRY RUN SERIES</span>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background: linear-gradient(135deg, #1a1a1a 0%, #111111 100%); border-radius: 24px; padding: 48px 40px; border: 1px solid rgba(255,255,255,0.1);">
              
              <!-- Badge -->
              <div style="text-align: center; margin-bottom: 24px;">
                <span style="display: inline-block; background-color: rgba(155,28,28,0.2); color: #dc2626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 3px; padding: 8px 16px; border-radius: 20px; border: 1px solid rgba(155,28,28,0.3);">Priority Access Confirmed</span>
              </div>

              <h1 style="color: white; font-size: 28px; font-weight: bold; text-align: center; margin: 0 0 16px 0; line-height: 1.2;">
                You're on the list, ${first_name}! 🎉
              </h1>
              
              <p style="color: #9ca3af; font-size: 16px; text-align: center; margin: 0 0 32px 0; line-height: 1.6;">
                Thanks for registering your interest in the Black Country Run Series 2026. You'll be one of the first to know when entries open.
              </p>

              <!-- What You Get Box -->
              <div style="background-color: rgba(255,255,255,0.05); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid rgba(255,255,255,0.08);">
                <h3 style="color: white; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 16px 0;">What you'll get:</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>48-hour priority entry window</strong> before general release
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Early bird pricing</strong> — series entry from just £35
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Guaranteed entry</strong> to all 3 races with a series pass
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; color: #d1d5db; font-size: 14px;">
                      <span style="color: #dc2626; margin-right: 8px;">✓</span>
                      <strong>Event updates</strong> including medal reveal and course details
                    </td>
                  </tr>
                </table>
              </div>

              ${racesList ? `
              <!-- Races Interested -->
              <div style="margin-bottom: 32px;">
                <h3 style="color: #6b7280; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px 0;">Races you're interested in:</h3>
                <ul style="color: #d1d5db; font-size: 14px; padding-left: 0; list-style: none; margin: 0;">
                  ${racesList}
                </ul>
              </div>
              ` : ''}

              ${club ? `
              <p style="color: #6b7280; font-size: 13px; margin: 0 0 32px 0;">
                Club: <span style="color: #9ca3af;">${club}</span>
              </p>
              ` : ''}

              <!-- CTA -->
              <div style="text-align: center; margin-bottom: 8px;">
                <a href="https://blackcountryrun.co.uk" style="display: inline-block; background: linear-gradient(135deg, #9b1c1c, #dc2626); color: white; font-weight: bold; font-size: 14px; padding: 14px 32px; border-radius: 12px; text-decoration: none; letter-spacing: 0.5px;">
                  Visit the Website
                </a>
              </div>
            </td>
          </tr>

          <!-- The 3 Races -->
          <tr>
            <td style="padding: 40px 0 0 0;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td width="33%" style="text-align: center; padding: 12px 8px;">
                    <div style="background-color: #1a1a1a; border-radius: 16px; padding: 20px 12px; border: 1px solid rgba(255,255,255,0.08);">
                      <div style="color: #dc2626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">8th July</div>
                      <div style="color: white; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Andy Holden 5K</div>
                      <div style="color: #6b7280; font-size: 10px;">Baggeridge Country Park</div>
                    </div>
                  </td>
                  <td width="33%" style="text-align: center; padding: 12px 8px;">
                    <div style="background-color: #1a1a1a; border-radius: 16px; padding: 20px 12px; border: 1px solid rgba(255,255,255,0.08);">
                      <div style="color: #dc2626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">23rd July</div>
                      <div style="color: white; font-size: 13px; font-weight: bold; margin-bottom: 4px;">GWR 5K</div>
                      <div style="color: #6b7280; font-size: 10px;">Railway Walk, Wombourne</div>
                    </div>
                  </td>
                  <td width="33%" style="text-align: center; padding: 12px 8px;">
                    <div style="background-color: #1a1a1a; border-radius: 16px; padding: 20px 12px; border: 1px solid rgba(255,255,255,0.08);">
                      <div style="color: #dc2626; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">29th July</div>
                      <div style="color: white; font-size: 13px; font-weight: bold; margin-bottom: 4px;">Dudley Zoo 5K</div>
                      <div style="color: #6b7280; font-size: 10px;">Dudley Zoo & Castle</div>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="text-align: center; padding: 40px 0 0 0;">
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
        `,
      }),
    });

    if (!emailResponse.ok) {
      const errorData = await emailResponse.json();
      console.error("Resend API error:", errorData);
      return new Response(JSON.stringify({ error: "Failed to send email", details: errorData }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await emailResponse.json();
    console.log("Email sent successfully:", result);

    return new Response(JSON.stringify({ success: true, id: result.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
