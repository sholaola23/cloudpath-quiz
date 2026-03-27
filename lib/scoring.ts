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

  // Build a lookup map: answer_id -> scores
  const answerMap = new Map<string, Record<ResultPath, number>>();
  for (const question of questions) {
    for (const answer of question.answers) {
      answerMap.set(answer.id, answer.scores as Record<ResultPath, number>);
    }
  }

  // Sum scores across all selected answers
  for (const answerId of answerIds) {
    const answerScores = answerMap.get(answerId);
    if (!answerScores) continue;

    for (const path of PATHS) {
      scores[path] += answerScores[path];
    }
  }

  const winner = resolveWinner(scores, answerIds, answerMap);

  return { scores, winner };
}

/**
 * Determine the winning path. If there's a tie, the path with the
 * highest single-answer score across all selected answers wins.
 * If still tied, fall back to path order (SA first).
 */
function resolveWinner(
  scores: Record<ResultPath, number>,
  answerIds: string[],
  answerMap: Map<string, Record<ResultPath, number>>
): ResultPath {
  const maxScore = Math.max(...PATHS.map((p) => scores[p]));
  const tiedPaths = PATHS.filter((p) => scores[p] === maxScore);

  if (tiedPaths.length === 1) {
    return tiedPaths[0];
  }

  // Tie-break: find which tied path has the most extreme single-answer score
  let bestPath = tiedPaths[0];
  let bestSingleScore = 0;

  for (const path of tiedPaths) {
    for (const answerId of answerIds) {
      const answerScores = answerMap.get(answerId);
      if (!answerScores) continue;

      if (answerScores[path] > bestSingleScore) {
        bestSingleScore = answerScores[path];
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
