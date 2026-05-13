import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPin, Radio, Check, X, Clock, Navigation } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";
import { useRequest } from "@/lib/request-store";

export const Route = createFileRoute("/request/matching")({
  component: Matching,
});

type DonorStatus = "pinging" | "viewed" | "declined" | "confirmed";
type Donor = {
  id: number;
  initial: string;
  zone: string;
  km: number;
  status: DonorStatus;
};

const SEED: Donor[] = [
  { id: 1, initial: "R", zone: "Saket", km: 1.4, status: "pinging" },
];

type TimelineTone = "done" | "active" | "muted";
type TimelineItem = { t: string; label: string; tone: TimelineTone };
const TIMELINE_INIT: TimelineItem[] = [
  { t: "00:00", label: "Request verified by coordinator", tone: "done" },
  { t: "00:02", label: "Searching nearby active donors…", tone: "active" },
  { t: "00:04", label: "Wave 1 notifications sent to 12 donors", tone: "active" },
];

function Matching() {
  const navigate = useNavigate();
  const { state } = useRequest();
  const [donors, setDonors] = useState<Donor[]>(SEED);
  const [timeline, setTimeline] = useState<TimelineItem[]>(TIMELINE_INIT);
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const tick = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const events: { at: number; run: () => void }[] = [
      {
        at: 1500,
        run: () =>
          setDonors((d) => [
            ...d,
            { id: 2, initial: "A", zone: "Lajpat Nagar", km: 2.1, status: "pinging" },
          ]),
      },
      {
        at: 2800,
        run: () => {
          setDonors((d) => d.map((x) => (x.id === 1 ? { ...x, status: "viewed" } : x)));
          setTimeline((tl) => [
            ...tl,
            { t: "00:05", label: "2 donors reviewing request", tone: "active" as const },
          ]);
        },
      },
      {
        at: 3600,
        run: () =>
          setDonors((d) => [
            ...d,
            { id: 3, initial: "S", zone: "Defence Colony", km: 2.6, status: "pinging" },
          ]),
      },
      {
        at: 4400,
        run: () => {
          setDonors((d) => d.map((x) => (x.id === 2 ? { ...x, status: "declined" } : x)));
          setTimeline((tl) => [
            ...tl,
            { t: "00:07", label: "1 donor unavailable — expanding radius to 8 km", tone: "muted" as const },
            { t: "00:08", label: "Wave 2 notifications sent to nearby zones", tone: "active" as const },
          ]);
        },
      },
      {
        at: 5200,
        run: () =>
          setDonors((d) => [
            ...d,
            { id: 4, initial: "M", zone: "Hauz Khas", km: 3.2, status: "pinging" },
          ]),
      },
      {
        at: 6200,
        run: () => {
          setDonors((d) => d.map((x) => (x.id === 3 ? { ...x, status: "viewed" } : x)));
          setTimeline((tl) => [
            ...tl,
            { t: "00:10", label: "Matching priority upgraded due to urgency", tone: "active" as const },
          ]);
        },
      },
      {
        at: 7400,
        run: () => {
          setDonors((d) => d.map((x) => (x.id === 1 ? { ...x, status: "confirmed" } : x)));
          setTimeline((tl) => [
            ...tl,
            { t: "00:12", label: "Donor confirmed — coordinator on call with attendant", tone: "done" as const },
          ]);
        },
      },
      { at: 8800, run: () => navigate({ to: "/request/confirmed" }) },
    ];
    const handles = events.map((e) => setTimeout(e.run, e.at));
    return () => handles.forEach(clearTimeout);
  }, [navigate]);

  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <StepShell
      eyebrow="Live matching"
      title="Reaching nearby donors now."
      subtitle={`We're pinging eligible ${state.bloodGroup || "compatible"} donors within 5 km of ${state.locality || "your hospital"}.`}
      showBack={false}
    >
      {/* Map mock */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-secondary/60 shadow-[var(--shadow-soft)]">
        <div className="aspect-[16/10] w-full bg-[radial-gradient(circle_at_50%_50%,oklch(0.96_0.02_25)_0%,oklch(0.97_0.005_25)_60%,oklch(0.95_0.008_25)_100%)]">
          <svg viewBox="0 0 400 250" className="h-full w-full" aria-hidden>
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="oklch(0.92 0.008 25)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="250" fill="url(#grid)" />
            <path d="M0 140 Q120 100 200 130 T400 110" stroke="oklch(0.88 0.008 25)" strokeWidth="2" fill="none" />
            <path d="M60 0 L80 250" stroke="oklch(0.9 0.008 25)" strokeWidth="1.5" />
            <path d="M280 0 L260 250" stroke="oklch(0.9 0.008 25)" strokeWidth="1.5" />
            {/* Donor pins */}
            {[
              [110, 80],
              [310, 90],
              [90, 200],
              [320, 195],
            ].map(([x, y], i) => (
              <g key={i}>
                <circle cx={x} cy={y} r="14" fill="oklch(0.52 0.22 25 / 0.15)">
                  <animate attributeName="r" values="6;18;6" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                  <animate attributeName="opacity" values="0.6;0;0.6" dur="2.4s" repeatCount="indefinite" begin={`${i * 0.4}s`} />
                </circle>
                <circle cx={x} cy={y} r="5" fill="oklch(0.52 0.22 25)" />
              </g>
            ))}
            {/* Hospital pin */}
            <g>
              <circle cx="200" cy="135" r="22" fill="oklch(0.52 0.22 25 / 0.15)">
                <animate attributeName="r" values="14;28;14" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="135" r="10" fill="oklch(0.42 0.2 25)" />
              <text x="200" y="139" textAnchor="middle" fontSize="11" fontWeight="700" fill="white">
                +
              </text>
            </g>
          </svg>
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground shadow-[var(--shadow-soft)] backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-pulse-ring" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          {donors.length} nearby donor{donors.length === 1 ? "" : "s"}
        </div>
        <div className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-background/90 px-3 py-1.5 text-xs font-mono font-medium text-foreground shadow-[var(--shadow-soft)] backdrop-blur">
          <Clock className="h-3 w-3 text-primary" />
          {mm}:{ss}
        </div>
      </div>

      {/* Donor list */}
      <div className="mt-6 space-y-2.5">
        {donors.map((d) => (
          <DonorCard key={d.id} donor={d} />
        ))}
      </div>

      {/* Timeline */}
      <div className="mt-8 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Live timeline
        </div>
        <ul className="mt-4 space-y-3">
          {timeline.map((t, i) => (
            <li key={i} className="flex items-center gap-3 animate-slide-up">
              <span className="font-mono text-[11px] text-muted-foreground">{t.t}</span>
              <span
                className={`h-2 w-2 rounded-full ${
                  t.tone === "done"
                    ? "bg-emerald-500"
                    : t.tone === "active"
                    ? "bg-primary animate-pulse-dot"
                    : "bg-muted-foreground/40"
                }`}
              />
              <span className="text-sm text-foreground">{t.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </StepShell>
  );
}

function DonorCard({ donor }: { donor: Donor }) {
  const meta = {
    pinging: { label: "Pinging…", tone: "text-primary bg-primary/10", icon: Radio, dot: true },
    viewed: { label: "Viewed request", tone: "text-amber-700 bg-amber-500/10", icon: Navigation, dot: false },
    declined: { label: "Unavailable", tone: "text-muted-foreground bg-secondary", icon: X, dot: false },
    confirmed: { label: "Confirmed", tone: "text-emerald-700 bg-emerald-500/10", icon: Check, dot: false },
  }[donor.status];
  const Icon = meta.icon;
  const dimmed = donor.status === "declined";

  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border p-4 shadow-[var(--shadow-soft)] transition-all animate-slide-up ${
        donor.status === "confirmed"
          ? "border-primary/40 bg-primary/5"
          : "border-border bg-card"
      } ${dimmed ? "opacity-60" : ""}`}
    >
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--gradient-emergency)] text-base font-semibold text-primary-foreground">
        {donor.initial}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">Donor {donor.initial}.</span>
          <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
            Verified
          </span>
        </div>
        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3" /> {donor.zone} · {donor.km} km
        </div>
      </div>
      <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${meta.tone}`}>
        {meta.dot ? <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" /> : <Icon className="h-3 w-3" />}
        {meta.label}
      </span>
    </div>
  );
}