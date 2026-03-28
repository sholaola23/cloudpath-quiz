// ============================================================
// CloudPath Quiz — Beehiiv API Client
// Subscribes users and applies result-specific tags
// ============================================================

/** Tag mapping from result path to Beehiiv tag */
const TAG_MAP: Record<string, string> = {
  SA: "cloudpath-sa",
  CE: "cloudpath-devops",
  SEC: "cloudpath-security",
  DML: "cloudpath-data-ml",
  SRE: "cloudpath-sre",
  CON: "cloudpath-consultant",
};

interface SubscribeParams {
  email: string;
  firstName: string;
  resultPath: string;
}

interface SubscribeResult {
  success: boolean;
  subscriberId?: string;
  alreadySubscribed?: boolean;
}

/**
 * Subscribe a user to Shola's Tech Notes on Beehiiv and apply tags.
 *
 * Tags applied:
 * - `source-cloudpath-quiz` (all quiz takers)
 * - Result-specific tag (e.g. `cloudpath-sa`)
 *
 * This function NEVER throws. On failure, it returns { success: false }.
 * The quiz result experience must never be blocked by a subscription error.
 */
export async function subscribeToNewsletter(
  params: SubscribeParams
): Promise<SubscribeResult> {
  try {
    const { email, firstName, resultPath } = params;

    const apiKey = process.env.BEEHIIV_API_KEY;
    const publicationId = process.env.BEEHIIV_PUBLICATION_ID;

    if (!apiKey || !publicationId) {
      console.error("Missing Beehiiv environment variables");
      return { success: false };
    }

    // Build tags array
    const resultTag = TAG_MAP[resultPath];
    const tags = ["source-cloudpath-quiz"];
    if (resultTag) {
      tags.push(resultTag);
    }

    // CloudPath Quiz Welcome Sequence automation ID (from Beehiiv)
    const CLOUDPATH_AUTOMATION_ID = "8c303051-3f3c-4170-8e98-f2dc5d2ded21";

    // Step 1: Create/reactivate subscriber AND auto-enroll in automation
    const response = await fetch(
      `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
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
            {
              name: "first_name",
              value: firstName,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error(
        `Beehiiv API error: ${response.status} ${response.statusText}`,
        errorText
      );
      return { success: false };
    }

    const data = await response.json();
    const subscriberId = data.data?.id;

    // Step 2: Add tags via POST to subscription tags endpoint
    // Tags cannot be set during creation — must be a separate call
    if (subscriberId) {
      try {
        const tagResponse = await fetch(
          `https://api.beehiiv.com/v2/publications/${publicationId}/subscriptions/${subscriberId}/tags`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${apiKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ tags }),
          }
        );
        if (!tagResponse.ok) {
          console.error("Beehiiv tag error:", await tagResponse.text());
        }
      } catch (tagErr) {
        console.error("Beehiiv tag error:", tagErr);
      }
    }

    return {
      success: true,
      subscriberId,
      alreadySubscribed: data.data?.status === "active",
    };
  } catch (error) {
    console.error("Beehiiv subscription error:", error);
    return { success: false };
  }
}
