// ============================================================
// CloudPath Quiz — Analytics Helper
// First-party, cookieless funnel events sent to /api/track
// (a Cloudflare Pages Function). No third-party scripts, no PII.
// Page-level traffic is handled separately by Cloudflare Web
// Analytics (beacon in app/layout.tsx).
// ============================================================

import type { SharePlatform } from "./types";

function trackEvent(
  eventName: string,
  properties?: Record<string, string | number>
) {
  if (typeof window === "undefined") return;

  const payload = JSON.stringify({ event: eventName, ...properties });

  try {
    // sendBeacon survives page navigation (e.g. result redirect)
    if (typeof navigator !== "undefined" && navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/track", blob);
    } else {
      void fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch {
    // analytics must never break the experience
  }

  // Also dispatch a local event for any in-page listeners/tests
  window.dispatchEvent(
    new CustomEvent("cloudpath_analytics", {
      detail: { event: eventName, ...properties },
    })
  );
}

/** User clicks "Start the Quiz" on the landing page */
export function trackQuizStart() {
  trackEvent("quiz_start");
}

/** User completes a question */
export function trackQuestionComplete(questionNumber: number) {
  trackEvent("question_complete", { question: questionNumber });
}

/** Email gate form is shown to the user */
export function trackEmailGateView() {
  trackEvent("email_gate_view");
}

/** User submits their email */
export function trackEmailSubmit() {
  trackEvent("email_submit");
}

/** Result page is viewed */
export function trackResultView(resultPath: string) {
  trackEvent("result_view", { result_path: resultPath });
}

/** User clicks a share button */
export function trackShareClick(resultPath: string, platform: SharePlatform) {
  trackEvent("share_click", { result_path: resultPath, platform });
}
