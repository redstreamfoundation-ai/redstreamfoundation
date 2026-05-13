import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Clock, Users, Activity } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/analytics")({
  component: Analytics,
});

const KPI = [
  { label: "Fulfillment rate", value: "94.2%", delta: "+2.1% vs last week", icon: TrendingUp },
  { label: "Avg response time", value: "11 min", delta: "-1.2 min vs last week", icon: Clock },
  { label: "Active donors", value: "1,284", delta: "+38 this week", icon: Users },
  { label: "Requests today", value: "59", delta: "47 fulfilled · 12 active", icon: Activity },
];

const FULFILL = [62, 71, 78, 74, 82, 88, 91, 89, 93, 90, 94, 96];
const DEMAND = [
  { g: "O+", v: 38 },
  { g: "B+", v: 32 },
  { g: "A+", v: 24 },
  { g: "AB+", v: 12 },
  { g: "O-", v: 18 },
  { g: "B-", v: 9 },
  { g: "A-", v: 8 },
  { g: "AB-", v: 4 },
];

const ZONES = [
  { z: "Rajinder Nagar", v: 92 },
  { z: "Saket", v: 88 },
  { z: "Karol Bagh", v: 81 },
  { z: "Dwarka", v: 76 },
  { z: "Pitampura", v: 64 },
  { z: "Lajpat Nagar", v: 59 },
  { z: "Mayur Vihar", v: 51 },
  { z: "Rohini", v: 47 },
  { z: "Vasant Kunj", v: 42 },
];

function Analytics() {
  return (
    <>
      <PageHeader
        eyebrow="Analytics"
        title="Operational performance"
        subtitle="Last 30 days · Delhi NCR"
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {KPI.map((k) => (
          <Card key={k.label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                  {k.label}
                </div>
                <div className="mt-2 font-serif-display text-3xl text-foreground">{k.value}</div>
                <div className="mt-1 text-[11px] text-emerald-600">{k.delta}</div>
              </div>
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                <k.icon className="h-4 w-4" />
              </span>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Fulfillment rate trend</h2>
              <p className="text-xs text-muted-foreground">Daily, last 12 days</p>
            </div>
            <span className="text-xs font-semibold text-emerald-600">+5.4%</span>
          </div>
          <LineChart data={FULFILL} />
        </Card>

        <Card className="p-5">
          <h2 className="text-sm font-semibold text-foreground">Blood group demand</h2>
          <p className="text-xs text-muted-foreground">Requests in last 30d</p>
          <ul className="mt-4 space-y-3">
            {DEMAND.sort((a, b) => b.v - a.v).map((d) => (
              <li key={d.g}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-foreground">{d.g}</span>
                  <span className="text-muted-foreground">{d.v}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full rounded-full bg-[var(--gradient-emergency)]"
                    style={{ width: `${(d.v / 38) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="mt-6 p-5">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Delhi request heatmap</h2>
            <p className="text-xs text-muted-foreground">Volume by zone, last 30d</p>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
            <span>Low</span>
            <span className="h-2 w-24 rounded-full bg-[linear-gradient(to_right,oklch(0.97_0.005_25),oklch(0.52_0.22_25))]" />
            <span>High</span>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-9">
          {ZONES.map((z) => (
            <div
              key={z.z}
              className="rounded-xl border border-border p-3 text-center"
              style={{
                background: `oklch(${1 - z.v * 0.0045} ${0.02 + z.v * 0.002} 25 / 1)`,
              }}
            >
              <div className={`text-[11px] font-medium ${z.v > 70 ? "text-white" : "text-foreground"}`}>
                {z.z}
              </div>
              <div className={`font-serif-display text-xl ${z.v > 70 ? "text-white" : "text-foreground"}`}>
                {z.v}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </>
  );
}

function LineChart({ data }: { data: number[] }) {
  const w = 600;
  const h = 180;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const span = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / span) * (h - 20) - 10;
    return [x, y] as const;
  });
  const path = points
    .map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`))
    .join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-4 w-full">
      <defs>
        <linearGradient id="ar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.62 0.24 25)" stopOpacity="0.25" />
          <stop offset="100%" stopColor="oklch(0.62 0.24 25)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#ar)" />
      <path d={path} fill="none" stroke="oklch(0.52 0.22 25)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {points.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="3" fill="oklch(0.52 0.22 25)" />
      ))}
    </svg>
  );
}