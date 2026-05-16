// ============================================================
// CloudPath Quiz — Scoring Engine
// Takes answer IDs, sums scores per path, returns the winner
// ============================================================

import type { ResultPath, ScoreBreakdown, QuizQuestion } from "./types";
import questionsData from "@/data/questions.json";
import resultsData from "@/data/results.json";

const PATHS: ResultPath[] = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

/**
 * Calculate scores for all paths given an array of answer IDs.
 *
 * @param answerIds - Array of answer IDs (e.g. ["q1_a", "q2_c", ...])
 * @returns ScoreBreakdown with per-path scores and the winning path
 */
/**
 * Calculate per-path scores from a flat list of selected answer IDs
 * (which may contain 1 OR 2 answers for the same question on the
 * multi-select questions — Q2/Q3/Q4/Q6).
 *
 * Each question contributes its DESIGNED weight regardless of how
 * many answers were picked: a selected answer's score vector is
 * divided by the number of picks on that question (averaging), so a
 * 2-pick question can't out-weight a 1-pick one and a multi-picker
 * is never advantaged over a single-picker.
 */
export function calculateScores(answerIds: string[]): ScoreBreakdown {
  const scores: Record<ResultPath, number> = {
    SA: 0,
    CE: 0,
    SEC: 0,
    DML: 0,
    SRE: 0,
    CON: 0,
  };

  const questions = questionsData.questions as QuizQuestion[];

  // answer_id -> raw scores
  const answerMap = new Map<string, Record<ResultPath, number>>();
  for (const question of questions) {
    for (const answer of question.answers) {
      answerMap.set(answer.id, answer.scores as Record<ResultPath, number>);
    }
  }

  // Group selected answers by question (id prefix, e.g. "q2" from "q2_a")
  const byQuestion = new Map<string, string[]>();
  for (const id of answerIds) {
    if (!answerMap.has(id)) continue;
    const qKey = id.split("_")[0];
    const list = byQuestion.get(qKey);
    if (list) list.push(id);
    else byQuestion.set(qKey, [id]);
  }

  // Averaged contribution per selected answer: scores / picksOnThatQuestion
  const contributions: Record<ResultPath, number>[] = [];
  for (const [, ids] of byQuestion) {
    const divisor = ids.length || 1;
    for (const id of ids) {
      const raw = answerMap.get(id)!;
      const contribution = {} as Record<ResultPath, number>;
      for (const path of PATHS) {
        contribution[path] = raw[path] / divisor;
        scores[path] += contribution[path];
      }
      contributions.push(contribution);
    }
  }

  const winner = resolveWinner(scores, contributions);

  return { scores, winner };
}

/**
 * Determine the winning path. If there's a tie on the (averaged)
 * totals, the tied path with the highest single AVERAGED contribution
 * wins — consistent with how the totals (and the displayed score
 * bars) are computed. If still tied, fall back to path order.
 */
function resolveWinner(
  scores: Record<ResultPath, number>,
  contributions: Record<ResultPath, number>[]
): ResultPath {
  const maxScore = Math.max(...PATHS.map((p) => scores[p]));
  const tiedPaths = PATHS.filter(
    (p) => Math.abs(scores[p] - maxScore) < 1e-9
  );

  if (tiedPaths.length === 1) {
    return tiedPaths[0];
  }

  let bestPath = tiedPaths[0];
  let bestSingle = -Infinity;
  for (const path of tiedPaths) {
    for (const c of contributions) {
      if (c[path] > bestSingle) {
        bestSingle = c[path];
        bestPath = path;
      }
    }
  }
  return bestPath;
}

/**
 * Get the answer text for a given answer ID.
 * Used when building the Claude prompt.
 */
export function getAnswerText(answerId: string): string | null {
  const questions = questionsData.questions as QuizQuestion[];
  for (const question of questions) {
    for (const answer of question.answers) {
      if (answer.id === answerId) {
        return answer.text;
      }
    }
  }
  return null;
}

/**
 * Get a result data object for a given path.
 */
export function getResultByPath(path: string) {
  return (
    resultsData.results.find((r: { path: string }) => r.path === path) ?? null
  );
}
