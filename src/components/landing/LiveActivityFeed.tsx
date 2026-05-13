import { useEffect, useState } from "react";
import { Check, MapPin, Radio } from "lucide-react";

type Event = {
  id: number;
  kind: "matched" | "fulfilled" | "enroute";
  group: string;
  zone: string;
  ago: string;
};

const SEED: Event[] = [
  { id: 1, kind: "matched", group: "B+", zone: "Saket", ago: "just now" },
  { id: 2, kind: "enroute", group: "O-", zone: "Karol Bagh", ago: "2 min" },
  { id: 3, kind: "fulfilled", group: "A+", zone: "Dwarka", ago: "5 min" },
  { id: 4, kind: "matched", group: "AB+", zone: "Noida 62", ago: "8 min" },
  { id: 5, kind: "fulfilled", group: "O+", zone: "Lajpat Nagar", ago: "12 min" },
];

const META: Record<Event["kind"], { label: string; icon: typeof Check; tone: string }> = {
  matched: { label: "Donor matched", icon: Radio, tone: "text-primary bg-primary/10" },
  enroute: { label: "Donor en route", icon: MapPin, tone: "text-primary bg-primary/10" },
  fulfilled: { label: "Request fulfilled", icon: Check, tone: "text-emerald-600 bg-emerald-500/10" },
};

export function LiveActivityFeed() {
  const [events, setEvents] = useState(SEED);

  useEffect(() => {
    const zones = ["Rohini", "Vasant Kunj", "Mayur Vihar", "Pitampura", "Hauz Khas", "Janakpuri"];
    const groups = ["O+", "O-", "A+", "B+", "AB+", "B-"];
    const kinds: Event["kind"][] = ["matched", "enroute", "fulfilled"];
    const t = setInterval(() => {
      setEvents((prev) => {
        const next: Event = {
          id: Date.now(),
          kind: kinds[Math.floor(Math.random() * kinds.length)],
          group: groups[Math.floor(Math.random() * groups.length)],
          zone: zones[Math.floor(Math.random() * zones.length)],
          ago: "just now",
        };
        return [next, ...prev.slice(0, 4)];
      });
    }, 3500);
    return () => clearInterval(t);
  }, []);

  return (
    <section aria-label="Live activity" className="bg-secondary/60 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Live across Delhi
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
              Real coordination, in real time.
            </h2>
          </div>
          <span className="hidden items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Live
          </span>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]">
          <ul className="divide-y divide-border">
            {events.map((e) => {
              const m = META[e.kind];
              const Icon = m.icon;
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-4 animate-slide-up"
                >
                  <span className={`grid h-9 w-9 place-items-center rounded-xl ${m.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                        {e.group}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      {e.zone}, Delhi NCR
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{e.ago}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Names anonymized. Activity simulated for preview.
        </p>
      </div>
    </section>
  );
}