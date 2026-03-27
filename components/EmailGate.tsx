"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface EmailGateProps {
  onSubmit: (firstName: string, email: string) => void;
}

export default function EmailGate({ onSubmit }: EmailGateProps) {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    const newErrors: { name?: string; email?: string } = {};

    if (!firstName.trim()) {
      newErrors.name = "Please enter your first name";
    }

    if (!email.trim()) {
      newErrors.email = "Please enter your email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    onSubmit(firstName.trim(), email.trim().toLowerCase());
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="w-full max-w-md mx-auto text-center"
    >
      {/* Headline */}
      <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mb-3 leading-tight">
        Where should I send your personalised career roadmap?
      </h2>

      {/* Subtext */}
      <p className="text-text-body text-sm sm:text-base mb-8 leading-relaxed">
        I&apos;ll use AI to write you a personalised result based on YOUR
        specific answers.
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* First name input */}
        <div className="text-left">
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => {
              setFirstName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
            }}
            autoComplete="given-name"
            className={`
              w-full px-4 py-3.5 rounded-xl
              bg-bg-card border text-text-primary text-sm
              placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-colors
              ${errors.name ? "border-red-500/60" : "border-bg-border"}
            `}
          />
          {errors.name && (
            <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.name}</p>
          )}
        </div>

        {/* Email input */}
        <div className="text-left">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email)
                setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            autoComplete="email"
            className={`
              w-full px-4 py-3.5 rounded-xl
              bg-bg-card border text-text-primary text-sm
              placeholder:text-text-muted
              focus:outline-none focus:ring-2 focus:ring-blue-500/50
              transition-colors
              ${errors.email ? "border-red-500/60" : "border-bg-border"}
            `}
          />
          {errors.email && (
            <p className="text-red-400 text-xs mt-1.5 ml-1">{errors.email}</p>
          )}
        </div>

        {/* Submit button */}
        <motion.button
          type="submit"
          disabled={isSubmitting}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="
            w-full py-3.5 rounded-xl font-semibold text-sm
            bg-blue-600 hover:bg-blue-500 text-white
            transition-colors cursor-pointer
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {isSubmitting ? "Loading..." : "Show My Result \u2192"}
        </motion.button>
      </form>

      {/* GDPR consent text */}
      <p className="text-text-muted text-xs mt-6 leading-relaxed">
        You&apos;ll also be subscribed to Shola&apos;s Tech Notes — a weekly
        newsletter with cloud career tips, cert strategies, and insider insights.
        Unsubscribe any time.{" "}
        <a
          href="/privacy"
          className="underline hover:text-text-body transition-colors"
        >
          Privacy policy
        </a>
      </p>
    </motion.div>
  );
}
