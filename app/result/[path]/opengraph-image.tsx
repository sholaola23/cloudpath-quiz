import { ImageResponse } from "next/og";
import resultsData from "@/data/results.json";

export const dynamicParams = false;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "CloudPath Quiz result";

const PATHS = ["SA", "CE", "SEC", "DML", "SRE", "CON"];

export function generateStaticParams() {
  return PATHS.map((path) => ({ path }));
}

export default async function OgImage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;
  const result = resultsData.results.find(
    (r) => r.path === path.toUpperCase()
  );

  const title = result?.title ?? "CloudPath Quiz";
  const archetype = result?.archetype ?? "Which cloud career fits you?";
  const emoji = result?.emoji ?? "☁️";
  const accent = result?.accent_colour ?? "#3B82F6";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "#0A0A0A",
          padding: "72px 80px",
          position: "relative",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 12,
            background: accent,
          }}
        />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            color: "#A1A1AA",
            letterSpacing: 2,
            textTransform: "uppercase",
            fontWeight: 600,
          }}
        >
          CloudPath Quiz · Shola&apos;s Tech Notes
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <div style={{ fontSize: 130, display: "flex" }}>{emoji}</div>
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#A1A1AA",
              marginBottom: 12,
              marginTop: 16,
            }}
          >
            My result:
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 82,
              fontWeight: 800,
              color: accent,
              lineHeight: 1.05,
            }}
          >
            {title}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              fontWeight: 600,
              color: "#FFFFFF",
              marginTop: 14,
            }}
          >
            {archetype}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            color: "#E4E4E7",
            fontWeight: 500,
          }}
        >
          Which cloud career fits you? Take the 3-minute quiz →
        </div>
      </div>
    ),
    { ...size }
  );
}
