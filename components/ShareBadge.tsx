"use client";

import { useState } from "react";
import type { ResultData } from "@/lib/types";

interface ShareBadgeProps {
  result: ResultData;
}

export default function ShareBadge({ result }: ShareBadgeProps) {
  const [copied, setCopied] = useState(false);

  const quizUrl = typeof window !== "undefined"
    ? `${window.location.origin}/result?path=${result.path}`
    : `https://cloudpath.sholastechnotes.com/result?path=${result.path}`;

  const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(quizUrl)}&summary=${encodeURIComponent(result.share_text)}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${result.share_text}\n\n${quizUrl}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = `${result.share_text}\n\n${quizUrl}`;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Copy link button */}
      <button
        onClick={handleCopyLink}
        className="
          flex-1 flex items-center justify-center gap-2
          px-5 py-3 rounded-xl
          bg-bg-card border border-bg-border
          text-text-body text-sm font-medium
          hover:bg-bg-hover hover:border-white/10
          transition-all cursor-pointer
        "
      >
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        {copied ? "Copied!" : "Copy result link"}
      </button>

      {/* LinkedIn share button */}
      <a
        href={linkedInUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="
          flex-1 flex items-center justify-center gap-2
          px-5 py-3 rounded-xl
          bg-[#0A66C2] hover:bg-[#004182]
          text-white text-sm font-medium
          transition-colors
        "
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
        Share on LinkedIn
      </a>
    </div>
  );
}
