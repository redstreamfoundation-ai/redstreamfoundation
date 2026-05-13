import { ClipboardCheck, Radar, HandHeart } from "lucide-react";

const STEPS = [
  {
    icon: ClipboardCheck,
    title: "Submit a verified request",
    body: "Hospital or family submits patient details. Our team verifies the request within minutes.",
  },
  {
    icon: Radar,
    title: "Nearby donors are matched",
    body: "Our system pings eligible, location-aware donors with the right blood group instantly.",
  },
  {
    icon: HandHeart,
    title: "Donor confirms and helps",
    body: "The first available donor confirms, coordinates with the hospital, and saves a life.",
  },
];

export function HowItWorks() {
  return (
    <section id="how" aria-label="How it works" className="bg-secondary/60 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            How it works
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Three steps from request to <span className="font-serif-display italic">rescue</span>.
          </h2>
        </div>

        <div className="relative grid gap-4 md:grid-cols-3 md:gap-6">
          <div
            aria-hidden
            className="absolute left-7 top-10 hidden h-px w-[calc(100%-3.5rem)] bg-gradient-to-r from-primary/30 via-primary/30 to-transparent md:block"
          />
          {STEPS.map((s, idx) => (
            <div
              key={s.title}
              className="relative rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-serif-display text-2xl text-muted-foreground">
                  0{idx + 1}
                </span>
              </div>
              <h3 className="mt-5 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}