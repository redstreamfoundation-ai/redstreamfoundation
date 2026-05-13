import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Users,
  Plus,
  Megaphone,
  Radio,
  ShieldCheck,
  ChevronRight,
  HeartPulse,
  ArrowUpRight,
} from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/")({
  component: Overview,
});

const STATS = [
  {
    label: "Active emergencies",
    value: "12",
    delta: "+3 last hour",
    icon: AlertTriangle,
    tone: "primary",
  },
  {
    label: "Pending verifications",
    value: "5",
    delta: "2 awaiting proof",
    icon: ShieldCheck,
    tone: "amber",
  },
  {
    label: "Available donors",
    value: "1,284",
    delta: "across 42 zones",
    icon: Users,
    tone: "emerald",
  },
  {
    label: "Fulfilled today",
    value: "47",
    delta: "94% within 30 min",
    icon: CheckCircle2,
    tone: "neutral",
  },
];

const FEED_SEED = [
  { kind: "match", text: "Donor R. confirmed for B+ at Sir Ganga Ram", zone: "Rajinder Nagar", t: "12s" },
  { kind: "request", text: "New critical request · O- · 2 units", zone: "Saket", t: "48s" },
  { kind: "verified", text: "Proof verified for request #4821", zone: "Dwarka", t: "1m" },
  { kind: "match", text: "3 donors notified within 4 km", zone: "Lajpat Nagar", t: "2m" },
  { kind: "fulfilled", text: "Request #4805 fulfilled · A+ · 1 unit", zone: "Karol Bagh", t: "3m" },
  { kind: "request", text: "New request · AB+ · within 2 hrs", zone: "Pitampura", t: "4m" },
  { kind: "expand", text: "Radius expanded to 12 km · request #4818", zone: "Mayur Vihar", t: "5m" },
];

function Overview() {
  const [feed, setFeed] = useState(FEED_SEED);
  useEffect(() => {
    const id = setInterval(() => {
      setFeed((f) => [
        FEED_SEED[Math.floor(Math.random() * FEED_SEED.length)],
        ...f.slice(0, 9),
      ]);
    }, 4500);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <PageHeader
        eyebrow="Command center"
        title="Operations overview"
        subtitle="Live snapshot of the Redstream emergency network across Delhi NCR."
        actions={
          <>
            <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
              <Megaphone className="h-3.5 w-3.5" /> Broadcast alert
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
              <Plus className="h-3.5 w-3.5" /> New manual request
            </button>
          </>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STATS.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {/* Live feed */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <div className="flex items-center gap-2">
              <Radio className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold text-foreground">
                Live operational activity
              </h2>
              <span className="ml-1 inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary">
                <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
                LIVE
              </span>
            </div>
            <Link
              to="/admin/matching"
              className="inline-flex items-center gap-1 text-xs font-semibold text-primary"
            >
              Open monitor <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <ul className="divide-y divide-border">
            {feed.map((e, i) => (
              <li
                key={`${i}-${e.text}`}
                className="flex items-center gap-3 px-5 py-3 animate-slide-up"
              >
                <FeedDot kind={e.kind} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm text-foreground">{e.text}</div>
                  <div className="text-[11px] text-muted-foreground">{e.zone}</div>
                </div>
                <span className="shrink-0 text-[11px] font-medium text-muted-foreground">
                  {e.t}
                </span>
              </li>
            ))}
          </ul>
        </Card>

        {/* Quick actions + zones */}
        <div className="space-y-6">
          <Card>
            <div className="border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Quick actions</h2>
            </div>
            <div className="grid grid-cols-2 gap-2 p-4">
              <QuickAction icon={ShieldCheck} label="Verify queue" to="/admin/requests" />
              <QuickAction icon={Megaphone} label="Notify donors" to="/admin/matching" />
              <QuickAction icon={Users} label="Add donor" to="/admin/donors" />
              <QuickAction icon={HeartPulse} label="Open coord call" to="/admin/matching" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="text-sm font-semibold text-foreground">Hot zones</h2>
              <span className="text-[11px] text-muted-foreground">last 24h</span>
            </div>
            <ul className="divide-y divide-border">
              {[
                { zone: "Rajinder Nagar", req: 9, fill: 92 },
                { zone: "Saket", req: 7, fill: 88 },
                { zone: "Dwarka", req: 6, fill: 76 },
                { zone: "Karol Bagh", req: 5, fill: 81 },
              ].map((z) => (
                <li key={z.zone} className="px-5 py-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-foreground">{z.zone}</span>
                    <span className="text-muted-foreground">
                      {z.req} req · {z.fill}%
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full bg-[var(--gradient-emergency)]"
                      style={{ width: `${z.fill}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  delta,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  delta: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "primary" | "amber" | "emerald" | "neutral";
}) {
  const map = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    neutral: "bg-secondary text-foreground",
  } as const;
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
            {label}
          </div>
          <div className="mt-2 font-serif-display text-3xl text-foreground">{value}</div>
          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
            <ArrowUpRight className="h-3 w-3 text-emerald-600" /> {delta}
          </div>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${map[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </Card>
  );
}

function FeedDot({ kind }: { kind: string }) {
  const map: Record<string, string> = {
    match: "bg-primary",
    request: "bg-amber-500",
    verified: "bg-emerald-500",
    fulfilled: "bg-emerald-500",
    expand: "bg-sky-500",
  };
  return (
    <span className={`h-2 w-2 shrink-0 rounded-full ${map[kind] || "bg-muted-foreground"}`} />
  );
}

function QuickAction({
  icon: Icon,
  label,
  to,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-start gap-2 rounded-xl border border-border bg-background p-3 text-left transition-all hover:border-primary/40 hover:bg-primary/5"
    >
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <span className="text-xs font-semibold text-foreground">{label}</span>
    </Link>
  );
}