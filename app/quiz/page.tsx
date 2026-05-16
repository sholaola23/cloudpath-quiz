"use client";

import { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import questionsData from "@/data/questions.json";
import { calculateScores } from "@/lib/scoring";
import {
  trackQuizStart,
  trackEmailGateView,
  trackEmailSubmit,
} from "@/lib/analytics";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import QuizQuestion from "@/components/QuizQuestion";
import EmailGate from "@/components/EmailGate";
import LoadingState from "@/components/LoadingState";

const questions = questionsData.questions as QuizQuestionType[];
const TOTAL_QUESTIONS = questions.length;
const PROGRESS_KEY = "cloudpath_progress";

type Phase = "quiz" | "email" | "loading";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  // One entry per question; each entry is the 1–2 selected answer IDs.
  const [answers, setAnswers] = useState<string[][]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    trackQuizStart();
  }, []);

  // Resume-on-refresh: rehydrate in-progress answers so a reload or
  // accidental tab nav doesn't lose a potential subscriber.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(PROGRESS_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as {
          answers?: string[][];
          currentQuestion?: number;
        };
        if (Array.isArray(saved.answers) && saved.answers.length > 0) {
          setAnswers(saved.answers);
          const q = Math.min(
            saved.currentQuestion ?? 0,
            TOTAL_QUESTIONS - 1
          );
          setCurrentQuestion(Math.max(0, q));
        }
      }
    } catch {
      // ignore corrupt storage
    }
    setRestored(true);
  }, []);

  // Persist progress whenever it changes (only after the initial restore)
  useEffect(() => {
    if (!restored) return;
    try {
      if (answers.some((a) => a && a.length > 0)) {
        localStorage.setItem(
          PROGRESS_KEY,
          JSON.stringify({ answers, currentQuestion })
        );
      }
    } catch {
      // storage full / unavailable — non-fatal
    }
  }, [answers, currentQuestion, restored]);

  useEffect(() => {
    if (phase === "email") trackEmailGateView();
  }, [phase]);

  const handleAnswer = useCallback(
    (answerIds: string[]) => {
      setAnswers((prev) => {
        const next = [...prev];
        next[currentQuestion] = answerIds;
        return next;
      });

      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        setPhase("email");
      }
    },
    [currentQuestion]
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestion((prev) => Math.max(0, prev - 1));
  }, []);

  const handleNext = useCallback(() => {
    if (currentQuestion < TOTAL_QUESTIONS - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      setPhase("email");
    }
  }, [currentQuestion]);

  const handleEmailSubmit = useCallback(
    async (firstName: string, email: string) => {
      trackEmailSubmit();
      setPhase("loading");

      const flatAnswers = answers.flat();
      const { scores, winner } = calculateScores(flatAnswers);

      const generatePromise = fetch("/api/generate-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: flatAnswers,
          result_path: winner,
          first_name: firstName,
          scores,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      // Subscribe: await + check success, retry once. The server also
      // persists to durable KV on failure, so a lead is never lost —
      // but we never block the result on it either.
      const subscribeOnce = () =>
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            first_name: firstName,
            result_path: winner,
          }),
        })
          .then((res) => (res.ok ? res.json() : null))
          .catch(() => null);

      const subscribePromise = (async () => {
        const first = await subscribeOnce();
        if (first?.success) return first;
        await new Promise((r) => setTimeout(r, 700));
        return subscribeOnce();
      })();

      const [generateResult] = await Promise.all([
        generatePromise,
        subscribePromise,
      ]);

      // Quiz complete — clear the resume cache
      try {
        localStorage.removeItem(PROGRESS_KEY);
      } catch {
        // non-fatal
      }

      // sessionStorage drives the immediate result render; localStorage
      // (keyed by path) lets the owner revisit /result/<path> later and
      // still see their personalised text + name.
      if (generateResult?.personalised_text) {
        const text = generateResult.personalised_text as string;
        sessionStorage.setItem("cloudpath_personalised", text);
        try {
          localStorage.setItem(`cloudpath_personalised_${winner}`, text);
        } catch {
          // non-fatal
        }
      }
      sessionStorage.setItem("cloudpath_name", firstName);
      sessionStorage.setItem("cloudpath_result_path", winner);
      try {
        localStorage.setItem(`cloudpath_name_${winner}`, firstName);
      } catch {
        // non-fatal
      }

      router.push(`/result/${winner}`);
    },
    [answers, router]
  );

  const currentAnswers = answers[currentQuestion] ?? [];

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {phase === "quiz" && (
        <div className="flex justify-start px-6 pt-4">
          <Link
            href="/"
            className="text-text-muted text-sm hover:text-text-primary transition-colors duration-200"
          >
            ← Back to home
          </Link>
        </div>
      )}

      {phase === "quiz" && (
        <div className="px-6 pt-2 pb-2 max-w-2xl mx-auto w-full">
          <ProgressBar
            currentQuestion={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            answers={answers.flat()}
          />
        </div>
      )}

      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {phase === "quiz" && (
          <QuizQuestion
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            questionIndex={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            selectedAnswers={currentAnswers}
            onPrevious={currentQuestion > 0 ? handlePrevious : undefined}
            onNext={currentAnswers.length > 0 ? handleNext : undefined}
          />
        )}

        {phase === "email" && <EmailGate onSubmit={handleEmailSubmit} />}

        {phase === "loading" && <LoadingState />}
      </div>
    </div>
  );
}
