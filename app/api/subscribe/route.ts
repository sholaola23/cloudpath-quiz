// ============================================================
// POST /api/subscribe
// Subscribes user to Beehiiv and applies result-specific tags
// ============================================================

import { NextRequest } from "next/server";
import { subscribeToNewsletter } from "@/lib/beehiiv";
import { RESULT_PATHS } from "@/lib/types";
import type { ResultPath, SubscribeRequest } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SubscribeRequest;

    // Validate required fields
    if (!body.email || !body.first_name || !body.result_path) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return Response.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate result path
    if (!RESULT_PATHS.includes(body.result_path as ResultPath)) {
      return Response.json(
        { error: "Invalid result path" },
        { status: 400 }
      );
    }

    // Subscribe via Beehiiv
    const result = await subscribeToNewsletter({
      email: body.email,
      firstName: body.first_name,
      resultPath: body.result_path,
    });

    return Response.json({
      success: result.success,
    });
  } catch (error) {
    console.error("Subscribe error:", error);

    // NEVER block the result experience — soft failure only
    // Return 200 so the frontend proceeds to show the result
    return Response.json(
      { success: false },
      { status: 200 }
    );
  }
}
