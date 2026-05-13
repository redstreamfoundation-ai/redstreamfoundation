import { MapPin } from "lucide-react";
import { AnimatedCounter } from "./AnimatedCounter";

const ZONES = [
  { z: "Rajinder Nagar", v: 92 },
  { z: "Saket", v: 88 },
  { z: "Karol Bagh", v: 81 },
  { z: "Dwarka", v: 76 },
  { z: "Pitampura", v: 64 },
  { z: "Lajpat Nagar", v: 59 },
  { z: "Mayur Vihar", v: 55 },
  { z: "Rohini", v: 52 },
  { z: "Vasant Kunj", v: 47 },
  { z: "Hauz Khas", v: 44 },
  { z: "Janakpuri", v: 41 },
  { z: "Noida 62", v: 38 },
];

export function CoverageMap() {
  return (
    <section
      aria-label="Delhi coverage"
      className="bg-secondary/60 px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid gap-4 md:grid-cols-2 md:items-end md:gap-12">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Coverage & density
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Active in <span className="font-serif-display italic">42 zones</span> across Delhi NCR.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
            Donor density is highest in the central and south corridors. Heatmap
            intensity reflects verified, currently-active donors per zone.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <Stat label="Verified donors" value={<AnimatedCounter to={8400} suffix="+" />} />
            <Stat label="Active emergency zones" value={<AnimatedCounter to={12} />} />
            <Stat label="Hospitals partnered" value={<AnimatedCounter to={68} />} />
            <Stat label="Avg notifications per request" value={<AnimatedCounter to={9} />} />
          </div>

          <div className="rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] lg:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-4 w-4 text-primary" /> Donor density · last 30 days
              </div>
              <div className="hidden items-center gap-2 text-[10px] text-muted-foreground sm:flex">
                <span>Low</span>
                <span className="h-2 w-24 rounded-full bg-[linear-gradient(to_right,oklch(0.97_0.005_25),oklch(0.52_0.22_25))]" />
                <span>High</span>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {ZONES.map((z) => {
                const dark = z.v > 65;
                return (
                  <div
                    key={z.z}
                    className="rounded-xl border border-border p-3 transition-transform hover:-translate-y-0.5"
                    style={{
                      background: `oklch(${1 - z.v * 0.0048} ${0.02 + z.v * 0.002} 25 / 1)`,
                    }}
                  >
                    <div
                      className={`text-[11px] font-medium ${dark ? "text-white/95" : "text-foreground"}`}
                    >
                      {z.z}
                    </div>
                    <div
                      className={`mt-1 font-serif-display text-xl ${dark ? "text-white" : "text-foreground"}`}
                    >
                      {z.v}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between border-b border-border py-3 last:border-b-0">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="font-serif-display text-2xl text-foreground">{value}</span>
    </div>
  );
}