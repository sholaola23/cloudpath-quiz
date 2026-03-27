"use client";

import { useSearchParams } from "next/navigation";
import { useSyncExternalStore, Suspense } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import resultsData from "@/data/results.json";
import type { ResultData } from "@/lib/types";
import SalaryRange from "@/components/SalaryRange";
import CertBadge from "@/components/CertBadge";
import ShareBadge from "@/components/ShareBadge";

// Read sessionStorage without triggering the setState-in-effect lint rule
function useSessionStorageValue(key: string): string | null {
  return useSyncExternalStore(
    // subscribe — sessionStorage doesn't emit events, so noop
    () => () => {},
    // getSnapshot — client
    () => sessionStorage.getItem(key),
    // getServerSnapshot — SSR
    () => null
  );
}

function ResultContent() {
  const searchParams = useSearchParams();
  const pathParam = searchParams.get("path");

  const storedPersonalisedText = useSessionStorageValue("cloudpath_personalised");
  const storedResultPath = useSessionStorageValue("cloudpath_result_path");
  const firstName = useSessionStorageValue("cloudpath_name") ?? "";

  // Only show personalised text if the stored path matches the URL path
  // (prevents stale personalised text showing on shared/bookmarked result URLs)
  const personalisedText =
    storedResultPath?.toUpperCase() === pathParam?.toUpperCase()
      ? storedPersonalisedText
      : null;

  // Find result data
  const result = resultsData.results.find(
    (r) => r.path === pathParam?.toUpperCase()
  ) as ResultData | undefined;

  if (!result) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center px-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-4">
            Result not found
          </h1>
          <p className="text-text-body mb-6">
            Something went wrong. Let&apos;s try the quiz again.
          </p>
          <Link
            href="/quiz"
            className="inline-flex px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-500 transition-colors"
          >
            Take the quiz again
          </Link>
        </div>
      </div>
    );
  }

  const accentColour = result.accent_colour;

  const buildCtaUrl = (cta: ResultData["cta_primary"]) => {
    const url = new URL(cta.url);
    Object.entries(cta.utm_params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
    return url.toString();
  };

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-2xl mx-auto px-6 py-12 sm:py-16">
        {/* ============================================================
            SECTION 1: Result Header
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-5xl sm:text-6xl block mb-4">
            {result.emoji}
          </span>
          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold mb-2 leading-tight"
            style={{ color: accentColour }}
          >
            {result.title}
          </h1>
          <p className="text-text-body text-lg sm:text-xl font-medium">
            {result.archetype}
          </p>
        </motion.div>

        {/* ============================================================
            SECTION 2: Personalised AI Section
            ============================================================ */}
        {personalisedText && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="mb-12 rounded-xl bg-bg-card border border-bg-border p-6 sm:p-8 relative overflow-hidden"
          >
            {/* Accent left border */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: accentColour }}
            />

            <h2 className="text-lg font-bold text-text-primary mb-4">
              Why this fits YOU{firstName ? `, ${firstName}` : ""}
            </h2>

            <div className="text-text-body text-sm sm:text-base leading-relaxed space-y-4">
              {personalisedText.split("\n\n").map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </div>

            <p className="text-text-muted text-xs mt-5">
              Personalised by AI based on your answers
            </p>
          </motion.div>
        )}

        {/* ============================================================
            SECTION 3: Description
            ============================================================ */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12"
        >
          <div className="text-text-body text-sm sm:text-base leading-relaxed space-y-4">
            {result.description.split("\n\n").map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
        </motion.div>

        {/* ============================================================
            SECTION 4: Day in the Life
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
            A Day in the Life
          </h2>
          <div className="space-y-3">
            {result.day_in_the_life.map((item, index) => (
              <div
                key={index}
                className="flex gap-3 items-start bg-bg-card border border-bg-border rounded-xl p-4"
              >
                <div
                  className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                  style={{ backgroundColor: accentColour }}
                />
                <p className="text-text-body text-sm leading-relaxed">
                  {item}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ============================================================
            SECTION 5: Salary Ranges
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
            Salary Ranges
          </h2>
          <SalaryRange
            salary_ranges={result.salary_ranges}
            accent_colour={accentColour}
          />
        </motion.section>

        {/* ============================================================
            SECTION 6: Certification Roadmap
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-6">
            Your Certification Roadmap
          </h2>

          {result.certifications.map((route) => (
            <div key={route.route} className="mb-8 last:mb-0">
              <div className="flex items-center gap-2 mb-4">
                <span
                  className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-md"
                  style={{
                    backgroundColor: `${accentColour}15`,
                    color: accentColour,
                  }}
                >
                  {route.route === "beginner"
                    ? "New to cloud?"
                    : "Got some experience?"}
                </span>
                <span className="text-text-muted text-xs">
                  {route.description}
                </span>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <CertBadge
                  cert={route.first_cert}
                  accent_colour={accentColour}
                  stepNumber={1}
                />
                <CertBadge
                  cert={route.second_cert}
                  accent_colour={accentColour}
                  stepNumber={2}
                />
              </div>
            </div>
          ))}
        </motion.section>

        {/* ============================================================
            SECTION 7: Skills to Develop
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
            Skills to Develop
          </h2>
          <div className="space-y-2.5">
            {result.skills.map((skill, index) => (
              <div key={index} className="flex items-start gap-3">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center text-xs font-bold text-white shrink-0 mt-0.5"
                  style={{ backgroundColor: accentColour }}
                >
                  {index + 1}
                </div>
                <p className="text-text-body text-sm leading-relaxed">
                  {skill}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ============================================================
            SECTION 8: Shola's Personal Take
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
            Shola&apos;s Take
          </h2>
          <blockquote
            className="bg-bg-card border border-bg-border rounded-xl p-6 relative overflow-hidden"
          >
            <div
              className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
              style={{ backgroundColor: accentColour }}
            />
            <p className="text-text-body text-sm sm:text-base leading-relaxed italic">
              &ldquo;{result.sholas_take}&rdquo;
            </p>
            <p className="text-text-muted text-xs mt-4 font-medium not-italic">
              — Shola Oladipupo, Solutions Architect at AWS
            </p>
          </blockquote>
        </motion.section>

        {/* ============================================================
            SECTION 9: CTAs
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex flex-col gap-3">
            <a
              href={buildCtaUrl(result.cta_primary)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                w-full flex items-center justify-center
                px-6 py-4 rounded-xl
                font-semibold text-white text-sm sm:text-base
                transition-all duration-200
                hover:shadow-lg
              "
              style={{ backgroundColor: accentColour }}
            >
              {result.cta_primary.text}
            </a>
            <a
              href={buildCtaUrl(result.cta_secondary)}
              target="_blank"
              rel="noopener noreferrer"
              className="
                w-full flex items-center justify-center
                px-6 py-4 rounded-xl
                border text-sm sm:text-base font-medium
                bg-transparent hover:bg-bg-hover
                transition-all duration-200
              "
              style={{
                borderColor: accentColour,
                color: accentColour,
              }}
            >
              {result.cta_secondary.text}
            </a>
          </div>
        </motion.section>

        {/* ============================================================
            SECTION 10: Share
            ============================================================ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.55 }}
          className="mb-12"
        >
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary mb-5">
            Share Your Result
          </h2>
          <ShareBadge result={result as ResultData} />
        </motion.section>

        {/* ============================================================
            FOOTER
            ============================================================ */}
        <footer className="border-t border-bg-border pt-8 text-center">
          <Link
            href="/quiz"
            className="text-text-muted text-sm hover:text-text-body transition-colors"
          >
            Take the quiz again
          </Link>
          <div className="mt-4 flex items-center justify-center gap-4 text-xs text-text-muted">
            <span>Shola&apos;s Tech Notes</span>
            <a
              href="/privacy"
              className="hover:text-text-body transition-colors"
            >
              Privacy policy
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
