import type { CertRecommendation } from "@/lib/types";

interface CertBadgeProps {
  cert: CertRecommendation;
  accent_colour: string;
  stepNumber: number;
}

const PROVIDER_ICONS: Record<string, string> = {
  AWS: "AWS",
  CompTIA: "CompTIA",
  ISC2: "ISC2",
  CNCF: "CNCF",
};

export default function CertBadge({
  cert,
  accent_colour,
  stepNumber,
}: CertBadgeProps) {
  return (
    <div className="bg-bg-card border border-bg-border rounded-xl p-5 relative overflow-hidden">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-3">
        <div
          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
          style={{ backgroundColor: accent_colour }}
        >
          {stepNumber}
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: accent_colour }}
        >
          {PROVIDER_ICONS[cert.provider] || cert.provider}
        </span>
      </div>

      {/* Cert name */}
      <h4 className="text-base font-bold text-text-primary mb-1">
        {cert.name}
      </h4>
      <p className="text-xs text-text-muted mb-3 font-mono">{cert.code}</p>

      {/* Meta row */}
      <div className="flex items-center gap-4 mb-3">
        <span className="text-xs text-text-body">
          {cert.study_weeks} weeks study
        </span>
        <span className="text-xs text-text-muted">|</span>
        <span className="text-xs text-text-body">
          ${cert.exam_cost_usd} exam
        </span>
      </div>

      {/* Rationale */}
      <p className="text-sm text-text-body leading-relaxed">{cert.why}</p>
    </div>
  );
}
