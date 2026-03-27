"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { QuizQuestion as QuizQuestionType } from "@/lib/types";

interface QuizQuestionProps {
  question: QuizQuestionType;
  onAnswer: (answerId: string) => void;
  questionIndex: number;
}

export default function QuizQuestion({
  question,
  onAnswer,
  questionIndex,
}: QuizQuestionProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (answerId: string) => {
    if (selectedId) return; // Prevent double-tap
    setSelectedId(answerId);

    // Brief delay for the animation to play before transitioning
    setTimeout(() => {
      onAnswer(answerId);
      setSelectedId(null);
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
                disabled={selectedId !== null}
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
      </motion.div>
    </AnimatePresence>
  );
}
