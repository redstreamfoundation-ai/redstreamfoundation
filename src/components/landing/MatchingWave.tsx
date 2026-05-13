import { useEffect, useState } from "react";
import { Building2, Clock, Navigation, Radio } from "lucide-react";

const RESPONSES = [
  { name: "Donor A.", km: 1.2, status: "Confirmed", tone: "emerald" },
  { name: "Donor R.", km: 2.8, status: "Considering", tone: "amber" },
  { name: "Donor M.", km: 3.4, status: "Notified", tone: "primary" },
  { name: "Donor S.", km: 4.1, status: "Notified", tone: "primary" },
] as const;

export function MatchingWave() {
  const [radius, setRadius] = useState(4);
  const [eta, setEta] = useState(14);
  useEffect(() => {
    const r = setInterval(() => setRadius((v) => (v >= 10 ? 4 : v + 1)), 1500);
    const e = setInterval(() => setEta((v) => (v <= 9 ? 14 : v - 1)), 2200);
    return () => {
      clearInterval(r);
      clearInterval(e);
    };
  }, []);

  return (
    <section
      aria-label="Matching wave visualization"
      className="bg-background px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-4 md:mb-14 md:grid-cols-2 md:items-end md:gap-12">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              How matching works
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Notification waves, <span className="font-serif-display italic">not blasts.</span>
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Redstream pings the closest matched donors first. If no one accepts within
            five minutes, the radius expands by 2 km — quietly, without spamming
            thousands of phones at once.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Wave visual */}
          <div className="relative overflow-hidden rounded-3xl border border-border bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-soft)] lg:col-span-3">
            <div className="relative aspect-[4/3] w-full">
              <svg viewBox="0 0 100 75" className="h-full w-full">
                <defs>
                  <pattern id="grid" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
                    <path
                      d="M 6.25 0 L 0 0 0 6.25"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.15"
                      className="text-border"
                    />
                  </pattern>
                </defs>
                <rect width="100" height="75" fill="url(#grid)" />

                {/* expanding waves */}
                {[0, 1, 2].map((i) => (
                  <circle
                    key={i}
                    cx="50"
                    cy="38"
                    r="6"
                    fill="none"
                    stroke="oklch(0.52 0.22 25)"
                    strokeWidth="0.4"
                    className="origin-center animate-wave"
                    style={{
                      animationDelay: `${i * 1}s`,
                      transformOrigin: "50px 38px",
                    }}
                  />
                ))}

                {/* radius circle */}
                <circle
                  cx="50"
                  cy="38"
                  r={radius * 2.2}
                  fill="oklch(0.52 0.22 25 / 0.06)"
                  stroke="oklch(0.52 0.22 25 / 0.4)"
                  strokeWidth="0.3"
                  strokeDasharray="0.8 0.8"
                  className="transition-all duration-700"
                />

                {/* donor pins */}
                {[
                  { x: 38, y: 30, c: "oklch(0.6 0.18 150)" },
                  { x: 62, y: 28, c: "oklch(0.7 0.18 80)" },
                  { x: 32, y: 50, c: "oklch(0.52 0.22 25)" },
                  { x: 68, y: 52, c: "oklch(0.52 0.22 25)" },
                  { x: 22, y: 22, c: "oklch(0.6 0.04 25)" },
                ].map((d, i) => (
                  <g key={i}>
                    <circle cx={d.x} cy={d.y} r="1.6" fill={d.c} stroke="white" strokeWidth="0.4" />
                  </g>
                ))}

                {/* hospital */}
                <circle cx="50" cy="38" r="3" fill="oklch(0.18 0.02 25)" />
                <circle cx="50" cy="38" r="1.4" fill="oklch(0.62 0.24 25)" />
              </svg>

              <div className="absolute left-4 top-4 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs shadow-[var(--shadow-soft)] backdrop-blur">
                <div className="flex items-center gap-2 font-semibold text-foreground">
                  <Building2 className="h-3.5 w-3.5 text-primary" /> Hospital
                </div>
                <div className="text-[11px] text-muted-foreground">B+ · 2 units needed</div>
              </div>

              <div className="absolute right-4 top-4 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs shadow-[var(--shadow-soft)] backdrop-blur">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Search radius
                </div>
                <div className="font-serif-display text-xl text-foreground">
                  {radius} <span className="text-xs text-muted-foreground">km</span>
                </div>
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-3 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs shadow-[var(--shadow-soft)] backdrop-blur">
                <Clock className="h-3.5 w-3.5 text-primary" />
                <div>
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Estimated arrival
                  </div>
                  <div className="font-serif-display text-base text-foreground">
                    ~ {eta} min
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Donor responses */}
          <div className="rounded-3xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] lg:col-span-2">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">
                Donor responses
              </h3>
              <span className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                LIVE
              </span>
            </div>
            <ul className="mt-4 divide-y divide-border">
              {RESPONSES.map((r) => (
                <li key={r.name} className="flex items-center gap-3 py-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                    {r.name.split(" ")[1]?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{r.name}</div>
                    <div className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Navigation className="h-3 w-3" /> {r.km} km
                    </div>
                  </div>
                  <Status tone={r.tone}>{r.status}</Status>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              Names anonymized · contact stays masked until confirmation.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Status({ tone, children }: { tone: string; children: React.ReactNode }) {
  const map: Record<string, string> = {
    emerald: "bg-emerald-500/10 text-emerald-700",
    amber: "bg-amber-500/10 text-amber-700",
    primary: "bg-primary/10 text-primary",
  };
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[tone]}`}
    >
      {children}
    </span>
  );
}