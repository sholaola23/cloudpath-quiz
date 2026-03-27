import Link from "next/link";

const PATH_LABELS = [
  { path: "SA", emoji: "\ud83c\udfd7\ufe0f", label: "Solutions Architect", colour: "#3B82F6" },
  { path: "CE", emoji: "\u2699\ufe0f", label: "Cloud/DevOps Engineer", colour: "#10B981" },
  { path: "SEC", emoji: "\ud83d\udee1\ufe0f", label: "Security Specialist", colour: "#EF4444" },
  { path: "DML", emoji: "\ud83d\udcca", label: "Data/ML Engineer", colour: "#8B5CF6" },
  { path: "SRE", emoji: "\u2699\ufe0f", label: "Platform/SRE", colour: "#F59E0B" },
  { path: "CON", emoji: "\ud83c\udf10", label: "Cloud Consultant", colour: "#06B6D4" },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-primary">
      {/* Hero section — full viewport */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <p className="text-text-muted text-xs sm:text-sm uppercase tracking-widest mb-6 font-medium">
            Free career quiz &middot; 3 minutes
          </p>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-text-primary leading-[1.1] tracking-tight mb-6">
            Which Cloud Career
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-emerald-400 to-cyan-400">
              Fits You?
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-text-body text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            8 questions. 3 minutes. A personalised career recommendation powered
            by AI — from someone who works in cloud every day.
          </p>

          {/* CTA button */}
          <Link
            href="/quiz"
            className="
              inline-flex items-center justify-center
              px-8 py-4 rounded-xl
              bg-blue-600 hover:bg-blue-500
              text-white font-semibold text-base sm:text-lg
              transition-all duration-200
              hover:shadow-[0_0_30px_rgba(59,130,246,0.3)]
              active:scale-[0.98]
            "
          >
            Start the Quiz &rarr;
          </Link>
        </div>
      </main>

      {/* Social proof section */}
      <section className="border-t border-bg-border py-16 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-text-muted text-sm mb-2">Built by</p>
          <p className="text-text-primary font-semibold text-lg mb-1">
            Shola Oladipupo
          </p>
          <p className="text-text-body text-sm mb-10">
            Solutions Architect at AWS &middot; Creator of Shola&apos;s Tech Notes
          </p>

          {/* 6 career path badges */}
          <p className="text-text-muted text-xs uppercase tracking-wider mb-5 font-medium">
            6 possible results
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-lg mx-auto">
            {PATH_LABELS.map((item) => (
              <div
                key={item.path}
                className="
                  flex items-center gap-2
                  px-3 py-2.5 rounded-lg
                  bg-bg-card border border-bg-border
                  text-text-body text-xs sm:text-sm
                "
              >
                <span className="text-base">{item.emoji}</span>
                <span className="truncate">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border py-8 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>Shola&apos;s Tech Notes</p>
          <div className="flex items-center gap-4">
            <a
              href="/privacy"
              className="hover:text-text-body transition-colors"
            >
              Privacy policy
            </a>
            <a
              href="https://sholastechnotes.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-body transition-colors"
            >
              Newsletter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
