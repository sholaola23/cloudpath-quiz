// ============================================================
// Cloudflare Pages Function — POST /api/subscribe
// Subscribes the user to Beehiiv + applies result tags.
// Static-export site, so this (not the Next API route) is the
// live endpoint. The lead-capture funnel must NEVER lose a lead
// silently — especially on a viral spike when Beehiiv may 429:
//   1. retry Beehiiv once with backoff
//   2. on final failure, write the lead to durable KV (LEADS_KV)
//   3. also fire a Resend alert if configured
// Never throws.
// ============================================================

interface KVLike {
  put(key: string, value: string): Promise<void>;
}

interface Env {
  BEEHIIV_API_KEY?: string;
  BEEHIIV_PUBLICATION_ID?: string;
  RESEND_API_KEY?: string;
  LEAD_BACKUP_EMAIL?: string;
  LEAD_BACKUP_FROM?: string;
  LEADS_KV?: KVLike;
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

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Durable last-resort capture. A lead written here is recoverable
 * via `wrangler kv key list`/`get` even if Beehiiv is down for hours.
 * Plus an optional Resend alert. Both soft-fail; never throw.
 */
async function backupLead(
  env: Env,
  email: string,
  firstName: string,
  resultPath: string,
  reason: string
): Promise<void> {
  const record = {
    email,
    first_name: firstName,
    result_path: resultPath,
    reason,
    ts: new Date().toISOString(),
  };

  try {
    if (env.LEADS_KV) {
      await env.LEADS_KV.put(
        `lead:${record.ts}:${email}`,
        JSON.stringify(record)
      );
    }
  } catch (err) {
    console.error("KV lead backup failed:", err);
  }

  try {
    if (env.RESEND_API_KEY && env.LEAD_BACKUP_EMAIL) {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from:
            env.LEAD_BACKUP_FROM ??
            "CloudPath Quiz <notifications@sholastechnotes.com>",
          to: [env.LEAD_BACKUP_EMAIL],
          subject: `[CloudPath] Beehiiv failed — recover lead: ${email}`,
          text:
            `Beehiiv subscribe failed (${reason}). Lead saved to KV (LEADS_KV) ` +
            `key lead:${record.ts}:${email}. Recover manually:\n\n` +
            `Name: ${firstName}\nEmail: ${email}\nResult: ${resultPath}\n` +
            `Time: ${record.ts}`,
        }),
      });
    }
  } catch (err) {
    console.error("Resend lead alert failed:", err);
  }
}

/** Create the Beehiiv subscriber. One retry on network error / 429 / 5xx. */
async function createSubscriber(
  env: Env,
  email: string,
  firstName: string
): Promise<{ ok: boolean; subscriberId?: string; status?: number }> {
  const body = JSON.stringify({
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
  });

  for (let attempt = 0; attempt < 2; attempt++) {
    if (attempt > 0) await sleep(600);
    try {
      const res = await fetch(
        `https://api.beehiiv.com/v2/publications/${env.BEEHIIV_PUBLICATION_ID}/subscriptions`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.BEEHIIV_API_KEY}`,
            "Content-Type": "application/json",
          },
          body,
        }
      );

      if (res.ok) {
        const data = (await res.json()) as {
          data?: { id?: string };
        };
        return { ok: true, subscriberId: data.data?.id, status: res.status };
      }

      // 4xx (other than 429) won't be fixed by retrying
      if (res.status < 500 && res.status !== 429) {
        console.error(
          `Beehiiv ${res.status} (no retry):`,
          await res.text().catch(() => "")
        );
        return { ok: false, status: res.status };
      }
      console.error(`Beehiiv ${res.status} (attempt ${attempt + 1})`);
    } catch (err) {
      console.error(`Beehiiv network error (attempt ${attempt + 1}):`, err);
    }
  }
  return { ok: false };
}

async function applyTags(
  env: Env,
  subscriberId: string,
  tags: string[]
): Promise<void> {
  try {
    const res = await fetch(
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
    if (!res.ok) {
      console.error("Beehiiv tag error:", await res.text().catch(() => ""));
    }
  } catch (err) {
    console.error("Beehiiv tag error:", err);
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
    await backupLead(env, email, firstName, resultPath, "missing-beehiiv-env");
    return json({ success: false }, 200);
  }

  const result = await createSubscriber(env, email, firstName);

  if (!result.ok) {
    await backupLead(
      env,
      email,
      firstName,
      resultPath,
      `beehiiv-failed${result.status ? `-${result.status}` : ""}`
    );
    return json({ success: false }, 200);
  }

  if (result.subscriberId) {
    const tags = ["source-cloudpath-quiz"];
    const resultTag = TAG_MAP[resultPath];
    if (resultTag) tags.push(resultTag);
    await applyTags(env, result.subscriberId, tags);
  }

  return json({ success: true });
};

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ error: "Method not allowed" }, 405);
};
