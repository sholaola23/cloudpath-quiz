// ============================================================
// Cloudflare Pages Function — POST /api/subscribe
// Subscribes the user to Beehiiv + applies result tags.
// The site is a static export on Cloudflare Pages, so the
// Next.js API route never runs in production — THIS does.
// Never throws: a subscription failure must not break the
// result experience, but it MUST NOT silently lose the lead
// either (Resend fallback below).
// ============================================================

interface Env {
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
  RESEND_API_KEY?: string;
  LEAD_BACKUP_EMAIL?: string;
  LEAD_BACKUP_FROM?: string;
}

const RESULT_PATHS = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

const TAG_MAP: Record<string, string> = {
  SA: "cloudpath-sa",
  CE: "cloudpath-devops",
  SEC: "cloudpath-security",
  DML: "cloudpath-data-ml",
  SRE: "cloudpath-sre",
  CON: "cloudpath-consultant",
};

const CLOUDPATH_AUTOMATION_ID = "8c303051-3f3c-4170-8e98-f2dc5d2ded21";

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

/**
 * Last-resort capture so a lead is NEVER lost silently if Beehiiv
 * is down. Env-gated: no-op unless RESEND_API_KEY + LEAD_BACKUP_EMAIL
 * are set. Soft-fail — never throws.
 */
async function backupLead(
  env: Env,
  email: string,
  firstName: string,
  resultPath: string
): Promise<void> {
  try {
    if (!env.RESEND_API_KEY || !env.LEAD_BACKUP_EMAIL) return;
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from:
          env.LEAD_BACKUP_FROM ?? "CloudPath Quiz <notifications@sholastechnotes.com>",
        to: [env.LEAD_BACKUP_EMAIL],
        subject: `[CloudPath] Beehiiv failed — capture this lead: ${email}`,
        text:
          `Beehiiv subscription failed. Capture this lead manually:\n\n` +
          `Name: ${firstName}\nEmail: ${email}\nResult: ${resultPath}\n` +
          `Time: ${new Date().toISOString()}`,
      }),
    });
  } catch (err) {
    console.error("Lead backup (Resend) failed:", err);
  }
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  let body: { email?: string; first_name?: string; result_path?: string };
  try {
    body = await request.json();
  } catch {
    return json({ success: false, error: "Invalid JSON" }, 200);
  }

  const email = (body.email ?? "").trim().toLowerCase();
  const firstName = (body.first_name ?? "").trim();
  const resultPath = body.result_path ?? "";

  if (!email || !firstName || !resultPath) {
    return json({ success: false, error: "Missing required fields" }, 200);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return json({ success: false, error: "Invalid email" }, 200);
  }
  if (!RESULT_PATHS.includes(resultPath)) {
    return json({ success: false, error: "Invalid result path" }, 200);
  }

  if (!env.BEEHIIV_API_KEY || !env.BEEHIIV_PUBLICATION_ID) {
    console.error("Missing Beehiiv env vars");
    await backupLead(env, email, firstName, resultPath);
    return json({ success: false }, 200);
  }

  try {
    const tags = ["source-cloudpath-quiz"];
    const resultTag = TAG_MAP[resultPath];
    if (resultTag) tags.push(resultTag);

    const subRes = await fetch(
      `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          reactivate_existing: true,
          send_welcome_email: false,
          utm_source: "cloudpath-quiz",
          utm_medium: "quiz",
          utm_campaign: "cloudpath-v2",
          automation_ids: [CLOUDPATH_AUTOMATION_ID],
          custom_fields: [
            { name: "first_name", value: firstName },
            { name: "source_product", value: "cloudpath" },
          ],
        }),
      }
    );

    if (!subRes.ok) {
      console.error(
        `Beehiiv error ${subRes.status}:`,
        await subRes.text().catch(() => "")
      );
      await backupLead(env, email, firstName, resultPath);
      return json({ success: false }, 200);
    }

    const data = (await subRes.json()) as {
      data?: { id?: string; status?: string };
    };
    const subscriberId = data.data?.id;

    if (subscriberId) {
      try {
        const tagRes = await fetch(
          `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions/${subscriberId}/tags`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tags }),
          }
        );
        if (!tagRes.ok) {
          console.error(
            "Beehiiv tag error:",
            await tagRes.text().catch(() => "")
          );
        }
      } catch (tagErr) {
        console.error("Beehiiv tag error:", tagErr);
      }
    }

    return json({ success: true });
  } catch (err) {
    console.error("Beehiiv subscription error:", err);
    await backupLead(env, email, firstName, resultPath);
    return json({ success: false }, 200);
  }
};

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ error: "Method not allowed" }, 405);
};
