import { Check, MapPin, Radio, HeartPulse, Clock } from "lucide-react";

type Item = {
  icon: React.ComponentType<{ className?: string }>;
  text: string;
  zone: string;
  tone: string;
};

const ITEMS: Item[] = [
  { icon: Check, text: "Donor confirmed", zone: "Dwarka", tone: "text-emerald-600" },
  { icon: HeartPulse, text: "Platelet request fulfilled", zone: "Rohini", tone: "text-primary" },
  { icon: Radio, text: "Emergency matching active near AIIMS", zone: "Ansari Nagar", tone: "text-primary" },
  { icon: MapPin, text: "Donor en route to Sir Ganga Ram", zone: "Rajinder Nagar", tone: "text-primary" },
  { icon: Clock, text: "Wave 2 notifications sent", zone: "Saket · 6 km radius", tone: "text-amber-600" },
  { icon: Check, text: "B+ request fulfilled in 9 minutes", zone: "Karol Bagh", tone: "text-emerald-600" },
  { icon: HeartPulse, text: "Critical O- request — 3 donors considering", zone: "Pitampura", tone: "text-primary" },
  { icon: Check, text: "Donor confirmed for Max Saket", zone: "Saket", tone: "text-emerald-600" },
  { icon: Radio, text: "Radius expanded to 10 km", zone: "Mayur Vihar", tone: "text-amber-600" },
  { icon: Check, text: "AB+ request fulfilled", zone: "Janakpuri", tone: "text-emerald-600" },
];

export function DelhiTicker() {
  const loop = [...ITEMS, ...ITEMS];
  return (
    <section
      aria-label="Live Delhi activity ticker"
      className="border-y border-border bg-card/60"
    >
      <div className="group relative overflow-hidden py-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background to-transparent" />
        <div className="flex w-max animate-ticker gap-8 group-hover:[animation-play-state:paused]">
          {loop.map((it, i) => {
            const Icon = it.icon;
            return (
              <div
                key={i}
                className="flex shrink-0 items-center gap-2.5 text-sm text-foreground"
              >
                <span
                  className={`grid h-7 w-7 place-items-center rounded-full bg-secondary ${it.tone}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </span>
                <span className="font-medium">{it.text}</span>
                <span className="text-muted-foreground">· {it.zone}</span>
                <span className="ml-2 h-1 w-1 rounded-full bg-border" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}