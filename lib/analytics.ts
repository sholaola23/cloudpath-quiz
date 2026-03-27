// ============================================================
// CloudPath Quiz — Analytics Helper
// Simple event tracking via Vercel Analytics custom events
// ============================================================

import type { SharePlatform } from "./types";

/**
 * Track a custom event. Uses Vercel Analytics if available,
 * falls back to a no-op in development.
 */
function trackEvent(eventName: string, properties?: Record<string, string | number>) {
  if (typeof window === "undefined") return;

  // Vercel Analytics custom events
  // @ts-expect-error — va is injected by Vercel Analytics script
  if (typeof window.va === "function") {
    // @ts-expect-error — va is injected by Vercel Analytics script
    window.va("event", { name: eventName, ...properties });
  }

  // Also dispatch a standard custom event for any other listeners
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
  trackEvent("question_complete", {
    question: questionNumber,
  });
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
  trackEvent("result_view", {
    result_path: resultPath,
  });
}

/** User clicks a share button */
export function trackShareClick(resultPath: string, platform: SharePlatform) {
  trackEvent("share_click", {
    result_path: resultPath,
    platform,
  });
}
