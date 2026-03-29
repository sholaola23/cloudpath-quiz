"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import questionsData from "@/data/questions.json";
import { calculateScores } from "@/lib/scoring";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import ProgressBar from "@/components/ProgressBar";
import QuizQuestion from "@/components/QuizQuestion";
import EmailGate from "@/components/EmailGate";
import LoadingState from "@/components/LoadingState";

const questions = questionsData.questions as QuizQuestionType[];
const TOTAL_QUESTIONS = questions.length;

type Phase = "quiz" | "email" | "loading";

export default function QuizPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [phase, setPhase] = useState<Phase>("quiz");

  const handleAnswer = useCallback(
    (answerId: string) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = answerId;
      setAnswers(newAnswers);

      if (currentQuestion < TOTAL_QUESTIONS - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        // All questions answered — move to email gate
        setPhase("email");
      }
    },
    [answers, currentQuestion]
  );

  const handlePrevious = useCallback(() => {
    setCurrentQuestion((prev) => prev - 1);
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
      setPhase("loading");

      // Calculate scores
      const { scores, winner } = calculateScores(answers);

      // Fire two API calls in parallel
      const generatePromise = fetch("/api/generate-result", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers,
          result_path: winner,
          first_name: firstName,
          scores,
        }),
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null);

      const subscribePromise = fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          first_name: firstName,
          result_path: winner,
        }),
      }).catch(() => null);

      // Wait for both
      const [generateResult] = await Promise.all([
        generatePromise,
        subscribePromise,
      ]);

      // Store personalised text and result path in sessionStorage
      if (generateResult?.personalised_text) {
        sessionStorage.setItem(
          "cloudpath_personalised",
          generateResult.personalised_text
        );
      }

      // Store the user's first name and result path
      sessionStorage.setItem("cloudpath_name", firstName);
      sessionStorage.setItem("cloudpath_result_path", winner);

      // Navigate to result
      router.push(`/result?path=${winner}`);
    },
    [answers, router]
  );

  return (
    <div className="min-h-screen bg-bg-primary flex flex-col">
      {/* Progress bar — only visible during quiz phase */}
      {phase === "quiz" && (
        <div className="px-6 pt-6 pb-2 max-w-2xl mx-auto w-full">
          <ProgressBar
            currentQuestion={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            answers={answers}
          />
        </div>
      )}

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-6 py-8">
        {phase === "quiz" && (
          <QuizQuestion
            question={questions[currentQuestion]}
            onAnswer={handleAnswer}
            questionIndex={currentQuestion}
            totalQuestions={TOTAL_QUESTIONS}
            selectedAnswer={answers[currentQuestion] ?? null}
            onPrevious={currentQuestion > 0 ? handlePrevious : undefined}
            onNext={answers[currentQuestion] != null ? handleNext : undefined}
          />
        )}

        {phase === "email" && <EmailGate onSubmit={handleEmailSubmit} />}

        {phase === "loading" && <LoadingState />}
      </div>
    </div>
  );
}
