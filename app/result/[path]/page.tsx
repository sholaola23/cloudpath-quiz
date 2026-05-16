import type { Metadata } from "next";
import { notFound } from "next/navigation";
import resultsData from "@/data/results.json";
import type { ResultData } from "@/lib/types";
import ResultView from "@/components/ResultView";

export const dynamicParams = false;

const PATHS = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

export function generateStaticParams() {
  return PATHS.map((path) => ({ path }));
}

function findResult(path: string): ResultData | undefined {
  return resultsData.results.find(
    (r) => r.path === path.toUpperCase()
  ) as ResultData | undefined;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ path: string }>;
}): Promise<Metadata> {
  const { path } = await params;
  const result = findResult(path);

  if (!result) {
    return { title: "CloudPath Quiz — Result" };
  }

  const title = `I'm ${result.archetype} (${result.title}) — CloudPath Quiz`;
  const description = result.og_description;
  // opengraph-image.tsx (colocated) auto-generates the per-path image
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "en_GB",
      siteName: "CloudPath Quiz by Shola's Tech Notes",
      url: `https://cloudpath.sholastechnotes.com/result/${result.path}`,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ResultPathPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const result = findResult(path);
  if (!result) notFound();

  return <ResultView path={result.path} />;
}
