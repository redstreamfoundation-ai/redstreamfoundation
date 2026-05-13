import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Radio, Phone, Megaphone, CheckCircle2, Clock, X } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/matching")({
  component: LiveMatching,
});

type Donor = {
  id: string;
  name: string;
  km: number;
  status: "pinged" | "considering" | "accepted" | "declined";
  cx: number;
  cy: number;
};

const HOSPITAL = { cx: 50, cy: 50, name: "Sir Ganga Ram", zone: "Rajinder Nagar" };
const SEED_DONORS: Donor[] = [
  { id: "d1", name: "Donor A.", km: 1.2, status: "accepted", cx: 38, cy: 42 },
  { id: "d2", name: "Donor R.", km: 2.8, status: "considering", cx: 64, cy: 38 },
  { id: "d3", name: "Donor M.", km: 3.4, status: "pinged", cx: 30, cy: 64 },
  { id: "d4", name: "Donor S.", km: 4.1, status: "pinged", cx: 70, cy: 70 },
  { id: "d5", name: "Donor K.", km: 4.9, status: "declined", cx: 22, cy: 30 },
];

const SEED_TIMELINE = [
  { t: "now", label: "Donor A. confirmed · ETA 9 min" },
  { t: "30s", label: "Donor R. is considering" },
  { t: "1m", label: "5 donors notified within 5 km" },
  { t: "2m", label: "Hospital coordinator briefed" },
  { t: "3m", label: "Request RS-4821 escalated to critical" },
];

function LiveMatching() {
  const [donors, setDonors] = useState<Donor[]>(SEED_DONORS);
  const [tl, setTl] = useState(SEED_TIMELINE);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setPulse((p) => p + 1);
      setDonors((ds) =>
        ds.map((d) => {
          if (d.status !== "pinged") return d;
          if (Math.random() < 0.15)
            return { ...d, status: Math.random() < 0.5 ? "considering" : "accepted" };
          return d;
        })
      );
    }, 2400);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      const samples = [
        "Notification wave 2 sent · radius 6 km",
        "Donor profile reviewed by coordinator",
        "Backup donor pool warmed",
        "Hospital blood bank checked-in",
      ];
      setTl((cur) => [
        { t: "now", label: samples[Math.floor(Math.random() * samples.length)] },
        ...cur.slice(0, 7),
      ]);
    }, 5500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Live monitor"
        title="Active matching · RS-4821"
        subtitle="B+ · 2 units · Sir Ganga Ram Hospital, Rajinder Nagar"
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
              <Phone className="h-3.5 w-3.5" /> Call hospital
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              <Megaphone className="h-3.5 w-3.5" /> Push next wave
            </button>
          </>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Map */}
        <Card className="lg:col-span-2 overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Coordination map
              </h2>
              <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                LIVE
              </span>
            </div>
            <div className="text-[11px] text-muted-foreground">5 km radius</div>
          </div>

          <div className="relative aspect-[4/3] bg-[oklch(0.985_0.005_25)]">
            {/* grid */}
            <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 75" preserveAspectRatio="none">
              <defs>
                <pattern id="g" width="6.25" height="6.25" patternUnits="userSpaceOnUse">
                  <path d="M 6.25 0 L 0 0 0 6.25" fill="none" stroke="currentColor" strokeWidth="0.15" className="text-border" />
                </pattern>
                <radialGradient id="hub" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="oklch(0.62 0.24 25)" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="oklch(0.62 0.24 25)" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect width="100" height="75" fill="url(#g)" />
              {/* notification waves */}
              {[8, 16, 24].map((r) => (
                <circle
                  key={r + pulse}
                  cx={HOSPITAL.cx}
                  cy={HOSPITAL.cy}
                  r={r}
                  fill="none"
                  stroke="oklch(0.52 0.22 25)"
                  strokeWidth="0.25"
                  opacity="0.6"
                  className="origin-center animate-pulse-ring"
                  style={{ transformOrigin: `${HOSPITAL.cx}px ${HOSPITAL.cy}px` }}
                />
              ))}
              <circle cx={HOSPITAL.cx} cy={HOSPITAL.cy} r="22" fill="url(#hub)" />
              {/* connection lines to active donors */}
              {donors
                .filter((d) => d.status === "accepted" || d.status === "considering")
                .map((d) => (
                  <line
                    key={d.id}
                    x1={HOSPITAL.cx}
                    y1={HOSPITAL.cy}
                    x2={d.cx}
                    y2={d.cy}
                    stroke={d.status === "accepted" ? "oklch(0.6 0.18 150)" : "oklch(0.65 0.16 80)"}
                    strokeWidth="0.4"
                    strokeDasharray="1 1"
                  />
                ))}
              {/* donor pins */}
              {donors.map((d) => (
                <g key={d.id}>
                  <circle
                    cx={d.cx}
                    cy={d.cy}
                    r={d.status === "accepted" ? 1.8 : 1.4}
                    fill={
                      d.status === "accepted"
                        ? "oklch(0.6 0.18 150)"
                        : d.status === "considering"
                        ? "oklch(0.7 0.18 80)"
                        : d.status === "declined"
                        ? "oklch(0.6 0.04 25)"
                        : "oklch(0.52 0.22 25)"
                    }
                    stroke="white"
                    strokeWidth="0.4"
                  />
                </g>
              ))}
              {/* hospital pin */}
              <g>
                <circle cx={HOSPITAL.cx} cy={HOSPITAL.cy} r="2.6" fill="oklch(0.18 0.02 25)" />
                <circle cx={HOSPITAL.cx} cy={HOSPITAL.cy} r="1.2" fill="oklch(0.62 0.24 25)" />
              </g>
            </svg>

            <div className="absolute left-4 top-4 rounded-xl border border-border bg-background/90 px-3 py-2 text-xs shadow-[var(--shadow-soft)] backdrop-blur">
              <div className="flex items-center gap-2 font-semibold text-foreground">
                <Building2 className="h-3.5 w-3.5 text-primary" /> {HOSPITAL.name}
              </div>
              <div className="text-[11px] text-muted-foreground">{HOSPITAL.zone}</div>
            </div>

            <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-xl border border-border bg-background/90 px-3 py-2 text-[11px] shadow-[var(--shadow-soft)] backdrop-blur">
              <Legend color="oklch(0.6 0.18 150)" label="Accepted" />
              <Legend color="oklch(0.7 0.18 80)" label="Considering" />
              <Legend color="oklch(0.52 0.22 25)" label="Pinged" />
              <Legend color="oklch(0.6 0.04 25)" label="Declined" />
            </div>
          </div>
        </Card>

        {/* Donor list + timeline */}
        <div className="space-y-6">
          <Card>
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">
                Donor responses ({donors.length})
              </h2>
            </div>
            <ul className="divide-y divide-border">
              {donors.map((d) => (
                <li key={d.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-[11px] font-semibold text-foreground">
                    {d.name.split(" ")[1]?.[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-foreground">{d.name}</div>
                    <div className="text-[11px] text-muted-foreground">{d.km} km away</div>
                  </div>
                  <DonorStatus s={d.status} />
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <Clock className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">Match timeline</h2>
            </div>
            <ol className="space-y-3 px-5 py-4">
              {tl.map((e, i) => (
                <li key={`${i}-${e.label}`} className="flex items-start gap-3 animate-slide-up">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm text-foreground">{e.label}</div>
                    <div className="text-[11px] text-muted-foreground">{e.t}</div>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

function DonorStatus({ s }: { s: Donor["status"] }) {
  const map = {
    accepted: { l: "Accepted", cls: "bg-emerald-500/10 text-emerald-700", icon: CheckCircle2 },
    considering: { l: "Considering", cls: "bg-amber-500/10 text-amber-700", icon: Clock },
    pinged: { l: "Pinged", cls: "bg-primary/10 text-primary", icon: Radio },
    declined: { l: "Declined", cls: "bg-secondary text-muted-foreground", icon: X },
  } as const;
  const v = map[s];
  const Icon = v.icon;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${v.cls}`}
    >
      <Icon className="h-3 w-3" /> {v.l}
    </span>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2 w-2 rounded-full" style={{ background: color }} />
      <span className="text-foreground">{label}</span>
    </div>
  );
}