// ============================================================
// POST /api/generate-result
// Generates personalised result text using Claude API
// ============================================================

import { NextRequest } from "next/server";
import { generatePersonalisedText } from "@/lib/claude";
import { RESULT_PATHS } from "@/lib/types";
import type { ResultPath, GenerateResultRequest } from "@/lib/types";

export const maxDuration = 15;

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = (await request.json()) as GenerateResultRequest;

    // Validate required fields
    if (!body.answers || !body.result_path || !body.first_name || !body.scores) {
      return Response.json(
        { error: "Missing required fields" },
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

    // Validate answers array
    if (!Array.isArray(body.answers) || body.answers.length === 0) {
      return Response.json(
        { error: "Answers must be a non-empty array" },
        { status: 400 }
      );
    }

    // Call Claude to generate personalised text
    const personalisedText = await generatePersonalisedText({
      answerIds: body.answers,
      resultPath: body.result_path,
      firstName: body.first_name,
      scores: body.scores,
    });

    // If Claude fails, return a static fallback
    if (!personalisedText) {
      console.warn(
        `Claude generation failed for ${body.result_path} (${Date.now() - startTime}ms) — returning fallback`
      );
      return Response.json({
        personalised_text: null,
        result_path: body.result_path,
        fallback: true,
      });
    }

    return Response.json({
      personalised_text: personalisedText,
      result_path: body.result_path,
    });
  } catch (error) {
    console.error("Generate result error:", error);

    // Return a soft failure — the frontend will show static content
    return Response.json(
      {
        personalised_text: null,
        result_path: null,
        fallback: true,
        error: "Failed to generate personalised result",
      },
      { status: 200 } // 200 intentionally — don't break the frontend
    );
  }
}
