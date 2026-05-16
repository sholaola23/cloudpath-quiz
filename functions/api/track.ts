// ============================================================
// Cloudflare Pages Function — POST /api/track
// First-party, cookieless funnel-event sink. No third-party
// scripts, no PII. Events are structured-logged and visible via
// `wrangler pages deployment tail` / the Cloudflare dashboard.
// Always 204 — analytics must never affect the user experience.
// ============================================================

const ALLOWED = new Set([
  "quiz_start",
  "question_complete",
  "email_gate_view",
  "email_submit",
  "result_view",
  "share_click",
]);

export const onRequestPost = async (context: {
  request: Request;
}): Promise<Response> => {
  try {
    const body = (await context.request.json()) as {
      event?: string;
      [k: string]: unknown;
    };
    if (body?.event && ALLOWED.has(body.event)) {
      console.log(
        JSON.stringify({
          t: "cloudpath_event",
          event: body.event,
          props: { ...body, event: undefined },
          ts: new Date().toISOString(),
          ua: context.request.headers.get("user-agent") ?? "",
          country: context.request.headers.get("cf-ipcountry") ?? "",
        })
      );
    }
  } catch {
    // swallow — analytics is never allowed to break anything
  }
  return new Response(null, { status: 204 });
};

export const onRequest = async (context: {
  request: Request;
}): Promise<Response> => {
  if (context.request.method === "POST") return onRequestPost(context);
  return new Response(null, { status: 204 });
};
