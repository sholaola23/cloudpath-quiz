"use client";

// Legacy redirect: the result page moved from /result?path=XX to
// /result/[path] so each path can have its own OG image + metadata
// for LinkedIn/social sharing. This keeps any already-shared
// ?path= links alive. sessionStorage (personalised text) survives
// same-origin client navigation, so the personalised result still
// shows after the redirect.

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

const PATHS = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

function Redirector() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const raw = searchParams.get("path");
    const path = raw?.toUpperCase();
    if (path && PATHS.includes(path)) {
      router.replace(`/result/${path}`);
    } else {
      router.replace("/quiz");
    }
  }, [router, searchParams]);

  return null;
}

export default function ResultRedirectPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-bg-primary flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
        </div>
      }
    >
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <div className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
      </div>
      <Redirector />
    </Suspense>
  );
}
