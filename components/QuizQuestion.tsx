"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";
import { trackQuestionComplete } from "@/lib/analytics";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answerIds: string[]) => void;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswers?: string[];
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function QuizQuestion({
  question,
  onAnswer,
  questionIndex,
  selectedAnswers,
  onPrevious,
  onNext,
}: QuizQuestionProps) {
  const maxSelect = question.maxSelect ?? 1;
  const isMulti = maxSelect > 1;

  const [selected, setSelected] = useState<string[]>(selectedAnswers ?? []);
  const [isAnimating, setIsAnimating] = useState(false);

  // Single-select: keep the original tap-to-advance feel
  const handleSingle = (answerId: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelected([answerId]);
    trackQuestionComplete(questionIndex + 1);
    setTimeout(() => {
      onAnswer([answerId]);
      setIsAnimating(false);
    }, 300);
  };

  // Multi-select: toggle up to maxSelect, then an explicit Continue
  const handleToggle = (answerId: string) => {
    setSelected((prev) => {
      if (prev.includes(answerId)) {
        return prev.filter((id) => id !== answerId);
      }
      if (prev.length >= maxSelect) return prev; // cap reached
      return [...prev, answerId];
    });
  };

  const handleContinue = () => {
    if (selected.length === 0) return;
    trackQuestionComplete(questionIndex + 1);
    onAnswer(selected);
  };

  const atCap = selected.length >= maxSelect;

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={questionIndex}
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -40 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className="w-full max-w-2xl mx-auto"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center leading-tight mb-3">
          {question.text}
        </h2>

        {question.subtext && (
          <p className="text-text-muted text-center text-sm mb-8">
            {question.subtext}
          </p>
        )}
        {!question.subtext && <div className="mb-8" />}

        <div className="flex flex-col gap-3">
          {question.answers.map((answer) => {
            const isSelected = selected.includes(answer.id);
            const dimmed = isMulti && !isSelected && atCap;

            return (
              <motion.button
                key={answer.id}
                onClick={() =>
                  isMulti
                    ? handleToggle(answer.id)
                    : handleSingle(answer.id)
                }
                disabled={!isMulti && isAnimating}
                whileTap={{ scale: 0.97 }}
                animate={
                  isSelected && !isMulti
                    ? { scale: [1, 0.97, 1], borderColor: "#3B82F6" }
                    : {}
                }
                transition={{ duration: 0.15 }}
                className={`
                  w-full text-left px-5 py-4 rounded-xl
                  border transition-all duration-200
                  cursor-pointer flex items-center gap-3
                  ${
                    isSelected
                      ? "bg-bg-hover border-blue-500/60 text-text-primary"
                      : "bg-bg-card border-bg-border hover:bg-bg-hover hover:border-white/10 text-text-body"
                  }
                  ${dimmed ? "opacity-45" : ""}
                  disabled:cursor-default
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                `}
              >
                {isMulti && (
                  <span
                    className={`
                      shrink-0 w-5 h-5 rounded-md border flex items-center justify-center text-[11px]
                      ${
                        isSelected
                          ? "bg-blue-500 border-blue-500 text-white"
                          : "border-bg-border text-transparent"
                      }
                    `}
                    aria-hidden
                  >
                    ✓
                  </span>
                )}
                <span className="text-sm sm:text-base leading-relaxed">
                  {answer.text}
                </span>
              </motion.button>
            );
          })}
        </div>

        {isMulti && (
          <p className="text-text-muted text-xs text-center mt-4">
            {selected.length === 0
              ? `Select up to ${maxSelect}`
              : `${selected.length} of ${maxSelect} selected`}
          </p>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          {onPrevious ? (
            <button
              onClick={onPrevious}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-muted border border-bg-border hover:bg-bg-hover hover:text-text-primary transition-all duration-200"
            >
              ← Previous
            </button>
          ) : (
            <div />
          )}

          {isMulti ? (
            <button
              onClick={handleContinue}
              disabled={selected.length === 0}
              className="px-6 py-2.5 rounded-lg text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Continue →
            </button>
          ) : (
            onNext && (
              <button
                onClick={onNext}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-primary bg-bg-card border border-bg-border hover:bg-bg-hover transition-all duration-200"
              >
                Next →
              </button>
            )
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
