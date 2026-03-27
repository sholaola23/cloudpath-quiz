"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import type { SalaryRange as SalaryRangeType } from "@/lib/types";

type Region = "uk" | "us" | "remote";

interface SalaryRangeProps {
  salary_ranges: SalaryRangeType[];
  accent_colour: string;
}

const REGION_LABELS: Record<Region, string> = {
  uk: "UK (GBP)",
  us: "US (USD)",
  remote: "Remote",
};

function extractNumbers(rangeStr: string): [number, number] {
  // Extract numbers from strings like "£45,000 - £65,000" or "$90,000 - $120,000+"
  const matches = rangeStr.match(/[\d,]+/g);
  if (!matches || matches.length < 2) return [0, 0];
  return [
    parseInt(matches[0].replace(/,/g, ""), 10),
    parseInt(matches[1].replace(/,/g, ""), 10),
  ];
}

function getRegionValue(range: SalaryRangeType, region: Region): string {
  switch (region) {
    case "uk":
      return range.uk_gbp;
    case "us":
      return range.us_usd;
    case "remote":
      return range.remote_global;
  }
}

export default function SalaryRange({
  salary_ranges,
  accent_colour,
}: SalaryRangeProps) {
  const [region, setRegion] = useState<Region>("uk");

  // Find max salary across all levels for bar width proportion
  const allValues = salary_ranges.map((r) => {
    const rangeStr = getRegionValue(r, region);
    const [, max] = extractNumbers(rangeStr);
    return max;
  });
  const maxSalary = Math.max(...allValues);

  return (
    <div>
      {/* Region toggle */}
      <div className="flex gap-1 p-1 bg-bg-card rounded-lg mb-6 w-fit">
        {(Object.keys(REGION_LABELS) as Region[]).map((key) => (
          <button
            key={key}
            onClick={() => setRegion(key)}
            className={`
              px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer
              ${
                region === key
                  ? "bg-bg-hover text-text-primary"
                  : "text-text-muted hover:text-text-body"
              }
            `}
          >
            {REGION_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Salary bars */}
      <div className="space-y-4">
        {salary_ranges.map((range, index) => {
          const rangeStr = getRegionValue(range, region);
          const [, max] = extractNumbers(rangeStr);
          const barWidth = maxSalary > 0 ? (max / maxSalary) * 100 : 0;

          return (
            <div key={range.level}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-text-body font-medium">
                  {range.level}
                </span>
                <span className="text-sm text-text-primary font-semibold">
                  {rangeStr}
                </span>
              </div>
              <div className="h-3 bg-bg-card rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: accent_colour }}
                  initial={{ width: 0 }}
                  animate={{ width: `${barWidth}%` }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.1,
                    ease: "easeOut",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
