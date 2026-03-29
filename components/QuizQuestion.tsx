"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answerId: string) => void;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer?: string | null;
  onPrevious?: () => void;
  onNext?: () => void;
}

export default function QuizQuestion({
  question,
  onAnswer,
  questionIndex,
  selectedAnswer,
  onPrevious,
  onNext,
}: QuizQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(
    selectedAnswer ?? null
  );
  const [isAnimating, setIsAnimating] = useState(false);

  const handleSelect = (answerId: string) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setSelectedId(answerId);

    // Brief delay for the animation to play before transitioning
    setTimeout(() => {
      onAnswer(answerId);
      setIsAnimating(false);
    }, 300);
  };

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
        {/* Question text */}
        <h2 className="text-2xl sm:text-3xl font-bold text-text-primary text-center leading-tight mb-3">
          {question.text}
        </h2>

        {question.subtext && (
          <p className="text-text-muted text-center text-sm mb-8">
            {question.subtext}
          </p>
        )}

        {!question.subtext && <div className="mb-8" />}

        {/* Answer buttons */}
        <div className="flex flex-col gap-3">
          {question.answers.map((answer) => {
            const isSelected = selectedId === answer.id;

            return (
              <motion.button
                key={answer.id}
                onClick={() => handleSelect(answer.id)}
                disabled={isAnimating}
                whileTap={{ scale: 0.97 }}
                animate={
                  isSelected
                    ? { scale: [1, 0.97, 1], borderColor: "#3B82F6" }
                    : {}
                }
                transition={{ duration: 0.15 }}
                className={`
                  w-full text-left px-5 py-4 rounded-xl
                  border transition-all duration-200
                  cursor-pointer
                  ${
                    isSelected
                      ? "bg-bg-hover border-white/20 text-text-primary"
                      : "bg-bg-card border-bg-border hover:bg-bg-hover hover:border-white/10 text-text-body"
                  }
                  disabled:cursor-default
                  focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500
                `}
              >
                <span className="text-sm sm:text-base leading-relaxed">
                  {answer.text}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Previous / Next navigation */}
        {(onPrevious || onNext) && (
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
            {onNext && (
              <button
                onClick={onNext}
                className="px-5 py-2.5 rounded-lg text-sm font-medium text-text-primary bg-bg-card border border-bg-border hover:bg-bg-hover transition-all duration-200"
              >
                Next →
              </button>
            )}
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
