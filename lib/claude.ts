// ============================================================
// CloudPath Quiz — Claude API Client
// Generates personalised result text using Claude Haiku
// ============================================================

import Anthropic from "@anthropic-ai/sdk";
import promptsData from "@/data/prompts.json";
import resultsData from "@/data/results.json";
import type { ResultPath, ResultData } from "./types";
import { getAnswerText } from "./scoring";

// Create the client fresh each call to ensure env vars are available
// (Next.js 16 + Turbopack edge cases with module-level process.env)
function getAnthropicClient(): Anthropic {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY environment variable is not set");
  }
  return new Anthropic({ apiKey });
}

interface GenerateParams {
  answerIds: string[];
  resultPath: ResultPath;
  firstName: string;
  scores: Record<ResultPath, number>;
}

/**
 * Generate a personalised result paragraph using Claude Haiku.
 *
 * @returns The personalised text, or null if generation fails.
 *          On null, the frontend should show the static fallback.
 */
export async function generatePersonalisedText(
  params: GenerateParams
): Promise<string | null> {
  try {
    const { answerIds, resultPath, firstName, scores } = params;

    // Find the result data for this path
    const resultData = resultsData.results.find(
      (r) => r.path === resultPath
    ) as ResultData | undefined;

    if (!resultData) {
      console.error(`No result data found for path: ${resultPath}`);
      return null;
    }

    const prompt = promptsData.generate_result;

    // Build the user prompt by replacing placeholders
    const userPrompt = buildUserPrompt(
      prompt.user_prompt_template,
      answerIds,
      resultData,
      firstName,
      scores
    );

    const message = await getAnthropicClient().messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: prompt.max_tokens,
      temperature: prompt.temperature,
      system: prompt.system_prompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    });

    // Extract text from the response
    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      console.error("No text block in Claude response");
      return null;
    }

    return textBlock.text;
  } catch (error) {
    console.error("Claude API error:", error);
    return null;
  }
}

/**
 * Replace {{placeholders}} in the prompt template with actual values.
 */
function buildUserPrompt(
  template: string,
  answerIds: string[],
  resultData: ResultData,
  firstName: string,
  scores: Record<ResultPath, number>
): string {
  // Map answer IDs to their text
  const answerTexts: Record<string, string> = {};
  for (const answerId of answerIds) {
    const qNum = answerId.split("_")[0]; // "q1" from "q1_a"
    answerTexts[qNum] = getAnswerText(answerId) ?? "Unknown";
  }

  // Build score breakdown string
  const scoreBreakdown = Object.entries(scores)
    .map(([path, score]) => `${path}: ${score}`)
    .join(", ");

  // Find cert routes
  const beginnerRoute = resultData.certifications.find(
    (c) => c.route === "beginner"
  );
  const acceleratedRoute = resultData.certifications.find(
    (c) => c.route === "accelerated"
  );

  let prompt = template;

  // Replace all placeholders
  prompt = prompt.replace("{{first_name}}", firstName);
  prompt = prompt.replace("{{result_title}}", resultData.title);
  prompt = prompt.replace("{{result_archetype}}", resultData.archetype);
  prompt = prompt.replace("{{q1_answer}}", answerTexts["q1"] ?? "Not answered");
  prompt = prompt.replace("{{q2_answer}}", answerTexts["q2"] ?? "Not answered");
  prompt = prompt.replace("{{q3_answer}}", answerTexts["q3"] ?? "Not answered");
  prompt = prompt.replace("{{q4_answer}}", answerTexts["q4"] ?? "Not answered");
  prompt = prompt.replace("{{q5_answer}}", answerTexts["q5"] ?? "Not answered");
  prompt = prompt.replace("{{q6_answer}}", answerTexts["q6"] ?? "Not answered");
  prompt = prompt.replace("{{q7_answer}}", answerTexts["q7"] ?? "Not answered");
  prompt = prompt.replace("{{q8_answer}}", answerTexts["q8"] ?? "Not answered");
  prompt = prompt.replace("{{score_breakdown}}", scoreBreakdown);
  prompt = prompt.replace(
    "{{beginner_first_cert}}",
    beginnerRoute?.first_cert.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{beginner_second_cert}}",
    beginnerRoute?.second_cert.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{accelerated_first_cert}}",
    acceleratedRoute?.first_cert.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{accelerated_second_cert}}",
    acceleratedRoute?.second_cert.name ?? "N/A"
  );

  return prompt;
}
