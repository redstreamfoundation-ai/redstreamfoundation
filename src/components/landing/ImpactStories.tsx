import { Quote, Clock, MapPin } from "lucide-react";

const STORIES = [
  {
    quote:
      "My father needed AB- at 2 AM. Within 14 minutes a donor was at the hospital. I don't know how to thank Redstream.",
    who: "Rina, attendant",
    where: "Max Saket",
    time: "Fulfilled in 14 min",
    group: "AB-",
  },
  {
    quote:
      "I got the notification while walking home. The hospital was 1.8 km away. I just walked over.",
    who: "Aarav, donor",
    where: "Sir Ganga Ram, Rajinder Nagar",
    time: "Confirmed in 4 min",
    group: "B+",
  },
  {
    quote:
      "Coordinator Priya stayed on call until the platelets reached the ICU. It felt like a team, not an app.",
    who: "Mohit, attendant",
    where: "BLK Max, Karol Bagh",
    time: "Fulfilled in 22 min",
    group: "O+",
  },
];

export function ImpactStories() {
  return (
    <section
      aria-label="Impact stories"
      className="bg-background px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            From the field
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Real coordination. <span className="font-serif-display italic">Real outcomes.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Anonymized stories from patients, attendants, and donors across Delhi NCR.
          </p>
        </div>

        <div className="grid gap-5 md:grid-cols-3">
          {STORIES.map((s, i) => (
            <article
              key={i}
              className="flex flex-col rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <Quote className="h-6 w-6 text-primary/60" />
              <p className="mt-4 flex-1 text-base leading-relaxed text-foreground">
                "{s.quote}"
              </p>
              <div className="mt-6 border-t border-border pt-4">
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-foreground">{s.who}</div>
                  <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                    {s.group}
                  </span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {s.where}
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-3 w-3" /> {s.time}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}