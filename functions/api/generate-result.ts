// ============================================================
// Cloudflare Pages Function — POST /api/generate-result
// Generates the personalised result paragraph via the Anthropic
// Messages REST API (no SDK — keeps the Worker bundle small).
// Static-export site, so this replaces the inert Next API route.
// Soft-fails to null so the result page shows static content.
// ============================================================

import promptsData from "../../data/prompts.json";
import resultsData from "../../data/results.json";
import questionsData from "../../data/questions.json";

interface Env {
  ANTHROPIC_API_KEY?: string;
}

const RESULT_PATHS = ["SA", "CE", "SEC", "DML", "SRE", "CON"];
const CLAUDE_MODEL = "claude-haiku-4-5";

// Lightweight per-isolate rate limit. Cloudflare runs many isolates
// so this is best-effort abuse damping, not a hard global limit —
// enough to blunt a single client hammering the Claude endpoint.
const RATE_LIMIT = 8; // requests
const RATE_WINDOW_MS = 60_000; // per minute per IP
const hits = new Map<string, { count: number; reset: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.reset) {
    hits.set(ip, { count: 1, reset: now + RATE_WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT;
}

const json = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" },
  });

interface AnswerLike {
  id: string;
  text: string;
}
interface QuestionLike {
  answers: AnswerLike[];
}

function getAnswerText(answerId: string): string {
  for (const q of (questionsData as { questions: QuestionLike[] }).questions) {
    for (const a of q.answers) {
      if (a.id === answerId) return a.text;
    }
  }
  return "Not answered";
}

function buildUserPrompt(
  template: string,
  answerIds: string[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resultData: any,
  firstName: string,
  scores: Record<string, number>
): string {
  // A question may have 1–2 selected answers (multi-select). Join
  // them so Claude sees BOTH, never just the last-clicked one.
  const answerTexts: Record<string, string> = {};
  for (const answerId of answerIds) {
    const qNum = answerId.split("_")[0];
    const text = getAnswerText(answerId);
    answerTexts[qNum] = answerTexts[qNum]
      ? `${answerTexts[qNum]}; also: ${text}`
      : text;
  }

  const scoreBreakdown = Object.entries(scores)
    .map(([path, score]) => `${path}: ${score}`)
    .join(", ");

  const beginner = resultData.certifications?.find(
    (c: { route: string }) => c.route === "beginner"
  );
  const accelerated = resultData.certifications?.find(
    (c: { route: string }) => c.route === "accelerated"
  );

  let prompt = template;
  prompt = prompt.replace("{{first_name}}", firstName);
  prompt = prompt.replace("{{result_title}}", resultData.title ?? "");
  prompt = prompt.replace("{{result_archetype}}", resultData.archetype ?? "");
  for (let i = 1; i <= 8; i++) {
    prompt = prompt.replace(
      `{{q${i}_answer}}`,
      answerTexts[`q${i}`] ?? "Not answered"
    );
  }
  prompt = prompt.replace("{{score_breakdown}}", scoreBreakdown);
  prompt = prompt.replace(
    "{{beginner_first_cert}}",
    beginner?.first_cert?.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{beginner_second_cert}}",
    beginner?.second_cert?.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{accelerated_first_cert}}",
    accelerated?.first_cert?.name ?? "N/A"
  );
  prompt = prompt.replace(
    "{{accelerated_second_cert}}",
    accelerated?.second_cert?.name ?? "N/A"
  );
  return prompt;
}

export const onRequestPost = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  const { request, env } = context;

  const ip =
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for") ??
    "unknown";
  if (rateLimited(ip)) {
    return json(
      { personalised_text: null, result_path: null, fallback: true },
      200
    );
  }

  let body: {
    answers?: string[];
    result_path?: string;
    first_name?: string;
    scores?: Record<string, number>;
  };
  try {
    body = await request.json();
  } catch {
    return json({ personalised_text: null, fallback: true }, 200);
  }

  const { answers, result_path, first_name, scores } = body;

  if (
    !answers ||
    !Array.isArray(answers) ||
    answers.length === 0 ||
    !result_path ||
    !first_name ||
    !scores ||
    !RESULT_PATHS.includes(result_path)
  ) {
    return json({ personalised_text: null, fallback: true }, 200);
  }

  if (!env.ANTHROPIC_API_KEY) {
    console.error("Missing ANTHROPIC_API_KEY");
    return json(
      { personalised_text: null, result_path, fallback: true },
      200
    );
  }

  try {
    const resultData = (
      resultsData as { results: { path: string }[] }
    ).results.find((r) => r.path === result_path);
    if (!resultData) {
      return json(
        { personalised_text: null, result_path, fallback: true },
        200
      );
    }

    const prompt = (promptsData as {
      generate_result: {
        system_prompt: string;
        user_prompt_template: string;
        max_tokens: number;
        temperature: number;
      };
    }).generate_result;

    const userPrompt = buildUserPrompt(
      prompt.user_prompt_template,
      answers,
      resultData,
      first_name,
      scores
    );

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: prompt.max_tokens,
        temperature: prompt.temperature,
        system: prompt.system_prompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!res.ok) {
      console.error(
        `Anthropic error ${res.status}:`,
        await res.text().catch(() => "")
      );
      return json(
        { personalised_text: null, result_path, fallback: true },
        200
      );
    }

    const data = (await res.json()) as {
      content?: { type: string; text?: string }[];
    };
    const textBlock = data.content?.find((b) => b.type === "text");
    const text = textBlock?.text ?? null;

    if (!text) {
      return json(
        { personalised_text: null, result_path, fallback: true },
        200
      );
    }

    return json({ personalised_text: text, result_path });
  } catch (err) {
    console.error("generate-result error:", err);
    return json(
      { personalised_text: null, result_path, fallback: true },
      200
    );
  }
};

export const onRequest = async (context: {
  request: Request;
  env: Env;
}): Promise<Response> => {
  if (context.request.method === "POST") return onRequestPost(context);
  return json({ error: "Method not allowed" }, 405);
};
