import { MapPinned, Target, TrendingUp } from "lucide-react";

const ZONES = [
  "South Delhi", "Central Delhi", "West Delhi", "Dwarka", "Rohini",
  "Saket", "Karol Bagh", "Janakpuri", "Mayur Vihar", "Pitampura",
];

export function DelhiPilot() {
  return (
    <section
      id="pilot"
      aria-label="Delhi pilot initiative"
      className="px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] md:p-12">
        <div className="grid gap-10 md:grid-cols-12 md:gap-12">
          <div className="md:col-span-5">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              Pilot phase · 2026
            </span>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              The Delhi Pilot <span className="font-serif-display italic">Initiative</span>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-muted-foreground">
              Redstream is launching first across selected Delhi NCR zones. We are
              deliberately starting small to perfect coordination quality, response
              times, and hospital workflows before scaling further.
            </p>
          </div>

          <div className="grid gap-4 md:col-span-7 md:grid-cols-3">
            <PilotStat
              icon={MapPinned}
              label="Active zones"
              value="10"
              caption="Delhi NCR localities onboarded"
            />
            <PilotStat
              icon={Target}
              label="Pilot focus"
              value="Quality"
              caption="Response time & coordination depth"
            />
            <PilotStat
              icon={TrendingUp}
              label="Expansion"
              value="Phased"
              caption="NCR-wide rollout in 2026–27"
            />

            <div className="rounded-2xl border border-dashed border-border bg-secondary/40 p-5 md:col-span-3">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Zones currently covered
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {ZONES.map((z) => (
                  <span
                    key={z}
                    className="rounded-full border border-border bg-background px-2.5 py-1 text-xs text-foreground"
                  >
                    {z}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PilotStat({
  icon: Icon,
  label,
  value,
  caption,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-5">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="mt-4 text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tracking-tight text-foreground">
        {value}
      </div>
      <div className="mt-1 text-xs leading-relaxed text-muted-foreground">{caption}</div>
    </div>
  );
}