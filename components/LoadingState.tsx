"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LOADING_MESSAGES = [
  "Analysing your answers...",
  "Matching your personality to 6 career paths...",
  "Generating your personalised result...",
  "Almost there...",
];

const MESSAGE_DELAYS = [0, 1500, 3000, 4500];

export default function LoadingState() {
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const timers = MESSAGE_DELAYS.slice(1).map((delay, index) =>
      setTimeout(() => {
        setVisibleCount(index + 2);
      }, delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="w-full max-w-md mx-auto text-center flex flex-col items-center justify-center min-h-[40vh]">
      {/* Pulsing dot */}
      <motion.div
        className="w-3 h-3 rounded-full bg-blue-500 mb-10"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.7, 1, 0.7],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Message sequence */}
      <div className="space-y-3">
        <AnimatePresence>
          {LOADING_MESSAGES.slice(0, visibleCount).map((message, index) => (
            <motion.p
              key={message}
              initial={{ opacity: 0, y: 10 }}
              animate={{
                opacity: index === visibleCount - 1 ? 1 : 0.4,
                y: 0,
              }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="text-sm sm:text-base"
              style={{
                color:
                  index === visibleCount - 1 ? "#FFFFFF" : "#71717A",
              }}
            >
              {message}
            </motion.p>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
