import { Clock, MapPin, Activity } from "lucide-react";

type Story = {
  group: string;
  context: string;
  locality: string;
  responseTime: string;
  summary: string;
  log: string[];
};

const STORIES: Story[] = [
  {
    group: "Platelets",
    context: "Dengue patient · ICU",
    locality: "Dwarka Sector 12",
    responseTime: "34 min",
    summary:
      "Platelet donor reached the hospital within 34 minutes after a Wave 2 notification expanded the search to nearby sectors.",
    log: [
      "00:00 · Request verified by coordinator",
      "00:06 · Wave 1 sent to 9 nearby donors",
      "00:18 · Radius expanded to Sector 7 & 9",
      "00:34 · Donor checked in at hospital reception",
    ],
  },
  {
    group: "O+",
    context: "Post-surgical bleed · overnight",
    locality: "AIIMS, Ansari Nagar",
    responseTime: "21 min",
    summary:
      "O+ donor coordinated near AIIMS during an overnight emergency. Coordinator stayed on call until the unit reached the ward.",
    log: [
      "02:14 · Request escalated — overnight critical",
      "02:16 · Wave 1 sent to 14 donors within 4 km",
      "02:23 · Donor confirmed, ETA shared with attendant",
      "02:35 · Donation completed, unit cleared for transfusion",
    ],
  },
  {
    group: "AB-",
    context: "Rare group · trauma case",
    locality: "Janakpuri West",
    responseTime: "47 min",
    summary:
      "AB- request fulfilled after the matching radius was expanded twice and priority was upgraded due to clinical urgency.",
    log: [
      "00:00 · Rare group flagged, priority raised",
      "00:12 · Radius expanded to 8 km",
      "00:28 · Radius expanded to 12 km, 6 new donors pinged",
      "00:47 · Donor confirmed and routed to hospital",
    ],
  },
];

export function ImpactStories() {
  return (
    <section
      aria-label="Real emergency response stories"
      className="bg-background px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            From the field
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Real Emergency Response <span className="font-serif-display italic">Stories</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Anonymized coordination logs from recent Delhi NCR responses. Names and
            patient details are removed; operational timing is preserved.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <article
              key={i}
              className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                  {s.group}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  Fulfilled
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold leading-snug text-foreground">
                {s.context}
              </h3>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {s.locality}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" /> Response · {s.responseTime}
                </span>
              </div>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                {s.summary}
              </p>
              <div className="mt-5 rounded-xl border border-border bg-secondary/40 p-3">
                <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  <Activity className="h-3 w-3 text-primary" /> Coordination log
                </div>
                <ul className="mt-2 space-y-1 font-mono text-[11px] leading-relaxed text-foreground/80">
                  {s.log.map((l) => (
                    <li key={l}>{l}</li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}