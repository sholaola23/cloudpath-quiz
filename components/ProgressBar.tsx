"use client";

import { motion } from "framer-motion";
import { calculateScores } from "@/lib/scoring";
import type { ResultPath } from "@/lib/types";

const PATH_COLOURS: Record<ResultPath, string> = {
  SA: "#3B82F6",
  CE: "#10B981",
  SEC: "#EF4444",
  DML: "#8B5CF6",
  SRE: "#F59E0B",
  CON: "#06B6D4",
};

interface ProgressBarProps {
  currentQuestion: number;
  totalQuestions: number;
  answers: string[];
}

export default function ProgressBar({
  currentQuestion,
  totalQuestions,
  answers,
}: ProgressBarProps) {
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const leadingPath: ResultPath =
    answers.length > 0 ? calculateScores(answers).winner : "SA";
  const accentColour = PATH_COLOURS[leadingPath];

  return (
    <div className="w-full">
      {/* Progress bar track */}
      <div className="h-1 w-full bg-bg-border rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ backgroundColor: accentColour }}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        />
      </div>

      {/* Question counter */}
      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-text-muted">
          Question{" "}
          <span className="text-text-body font-medium">
            {currentQuestion + 1}
          </span>{" "}
          of {totalQuestions}
        </p>
        <motion.div
          className="h-2 w-2 rounded-full"
          style={{ backgroundColor: accentColour }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </div>
    </div>
  );
}
