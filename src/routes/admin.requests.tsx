import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Check,
  X,
  Megaphone,
  Maximize2,
  FileText,
  Filter,
  Droplet,
  MapPin,
  Clock,
  ShieldCheck,
  Building2,
  ChevronRight,
  Eye,
} from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/requests")({
  component: RequestQueue,
});

type Urgency = "critical" | "within-2h" | "today";
type Match = "matching" | "matched" | "unmatched";
type Proof = "verified" | "pending" | "rejected";

type Req = {
  id: string;
  group: string;
  units: number;
  urgency: Urgency;
  hospital: string;
  zone: string;
  proof: Proof;
  match: Match;
  age: string;
  attendant: string;
  notes: string;
  timeline: { t: string; label: string }[];
};

const REQUESTS: Req[] = [
  {
    id: "RS-4821",
    group: "B+",
    units: 2,
    urgency: "critical",
    hospital: "Sir Ganga Ram Hospital",
    zone: "Rajinder Nagar",
    proof: "verified",
    match: "matching",
    age: "47, post-surgery",
    attendant: "Ankit (brother)",
    notes: "Surgery scheduled for 6 PM. Hospital blood bank confirmed shortage.",
    timeline: [
      { t: "12:04", label: "Request submitted" },
      { t: "12:06", label: "Proof verified by coordinator" },
      { t: "12:07", label: "8 donors notified within 4 km" },
      { t: "12:09", label: "1 donor accepted, 2 considering" },
    ],
  },
  {
    id: "RS-4820",
    group: "O-",
    units: 1,
    urgency: "critical",
    hospital: "AIIMS Delhi",
    zone: "Ansari Nagar",
    proof: "pending",
    match: "unmatched",
    age: "29, accident",
    attendant: "Ravi (friend)",
    notes: "Awaiting hospital requisition slip upload.",
    timeline: [
      { t: "12:01", label: "Request submitted" },
      { t: "12:02", label: "Proof requested from attendant" },
    ],
  },
  {
    id: "RS-4818",
    group: "A+",
    units: 1,
    urgency: "within-2h",
    hospital: "Max Saket",
    zone: "Saket",
    proof: "verified",
    match: "matched",
    age: "62, dialysis",
    attendant: "Rina (daughter)",
    notes: "Recurring patient, monthly dialysis cycle.",
    timeline: [
      { t: "11:48", label: "Request submitted" },
      { t: "11:50", label: "Proof verified" },
      { t: "11:53", label: "Donor S. confirmed · ETA 22 min" },
    ],
  },
  {
    id: "RS-4815",
    group: "AB+",
    units: 1,
    urgency: "today",
    hospital: "Fortis Shalimar Bagh",
    zone: "Shalimar Bagh",
    proof: "verified",
    match: "matching",
    age: "54, scheduled procedure",
    attendant: "Mohit (son)",
    notes: "Required by 8 PM today.",
    timeline: [
      { t: "11:20", label: "Request submitted" },
      { t: "11:24", label: "Proof verified" },
      { t: "11:30", label: "12 donors notified" },
    ],
  },
  {
    id: "RS-4811",
    group: "B-",
    units: 2,
    urgency: "within-2h",
    hospital: "BLK Max",
    zone: "Karol Bagh",
    proof: "rejected",
    match: "unmatched",
    age: "—",
    attendant: "—",
    notes: "Proof failed verification — duplicate slip detected.",
    timeline: [
      { t: "10:55", label: "Request submitted" },
      { t: "11:02", label: "Proof rejected" },
    ],
  },
];

const URGENCY_FILTERS: Array<"all" | Urgency> = ["all", "critical", "within-2h", "today"];

function RequestQueue() {
  const [filter, setFilter] = useState<"all" | Urgency>("all");
  const [selectedId, setSelectedId] = useState<string>(REQUESTS[0].id);
  const list = REQUESTS.filter((r) => filter === "all" || r.urgency === filter);
  const selected = REQUESTS.find((r) => r.id === selectedId) ?? REQUESTS[0];

  return (
    <>
      <PageHeader
        eyebrow="Queue"
        title="Emergency request queue"
        subtitle={`${REQUESTS.length} active · sorted by urgency`}
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
            <Filter className="h-3.5 w-3.5" /> Advanced filters
          </button>
        }
      />

      <div className="mb-4 flex flex-wrap gap-2">
        {URGENCY_FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium capitalize transition-colors ${
              filter === f
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-secondary"
            }`}
          >
            {f === "all" ? "All requests" : f.replace("-", " ")}
          </button>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="hidden grid-cols-12 gap-2 border-b border-border bg-secondary/40 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground md:grid">
            <div className="col-span-2">ID · Group</div>
            <div className="col-span-3">Hospital</div>
            <div className="col-span-2">Urgency</div>
            <div className="col-span-2">Proof</div>
            <div className="col-span-3">Matching</div>
          </div>
          <ul className="divide-y divide-border">
            {list.map((r) => {
              const active = r.id === selected.id;
              return (
                <li
                  key={r.id}
                  onClick={() => setSelectedId(r.id)}
                  className={`grid cursor-pointer grid-cols-12 gap-2 px-5 py-4 text-sm transition-colors ${
                    active ? "bg-primary/5" : "hover:bg-secondary/40"
                  }`}
                >
                  <div className="col-span-12 flex items-center gap-3 md:col-span-2">
                    <div className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-emergency)] text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
                      {r.group}
                    </div>
                    <div className="leading-tight">
                      <div className="font-semibold text-foreground">{r.id}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {r.units} unit{r.units > 1 ? "s" : ""}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-3">
                    <div className="font-medium text-foreground">{r.hospital}</div>
                    <div className="mt-0.5 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {r.zone}
                    </div>
                  </div>
                  <div className="col-span-6 flex items-center md:col-span-2">
                    <UrgencyBadge u={r.urgency} />
                  </div>
                  <div className="col-span-6 flex items-center md:col-span-2">
                    <ProofBadge p={r.proof} />
                  </div>
                  <div className="col-span-12 flex items-center justify-between md:col-span-3">
                    <MatchBadge m={r.match} />
                    <ChevronRight className="hidden h-4 w-4 text-muted-foreground md:block" />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Detail panel */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="overflow-hidden">
            <div className="flex items-start justify-between border-b border-border p-5">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-primary">
                  Request detail
                </div>
                <div className="mt-1 flex items-center gap-2 text-lg font-semibold text-foreground">
                  {selected.id}
                  <span className="font-serif-display text-xl text-primary">
                    · {selected.group}
                  </span>
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {selected.units} unit · {selected.age}
                </div>
              </div>
              <UrgencyBadge u={selected.urgency} />
            </div>

            <div className="space-y-3 p-5">
              <Row icon={Building2} label="Hospital" value={selected.hospital} />
              <Row icon={MapPin} label="Zone" value={selected.zone} />
              <Row icon={ShieldCheck} label="Attendant" value={selected.attendant} />
              <p className="rounded-xl border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {selected.notes}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2 border-t border-border bg-secondary/30 p-3">
              <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
                <Check className="h-3.5 w-3.5" /> Approve
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
                <X className="h-3.5 w-3.5" /> Reject
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:bg-[var(--primary-deep)]">
                <Megaphone className="h-3.5 w-3.5" /> Notify donors
              </button>
              <button className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
                <Maximize2 className="h-3.5 w-3.5" /> Expand radius
              </button>
            </div>
          </Card>

          {/* Proof */}
          <Card className="p-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <FileText className="h-4 w-4 text-primary" /> Hospital requisition
              </div>
              <button className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
                <Eye className="h-3 w-3" /> Open
              </button>
            </div>
            <div className="mt-3 grid place-items-center rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-8 text-center">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-background shadow-[var(--shadow-soft)]">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div className="mt-3 text-xs font-medium text-foreground">
                requisition_{selected.id}.pdf
              </div>
              <div className="text-[11px] text-muted-foreground">
                Stamped · uploaded by attendant
              </div>
            </div>
          </Card>

          {/* Timeline */}
          <Card className="p-5">
            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Clock className="h-4 w-4 text-primary" /> Request timeline
            </div>
            <ol className="mt-4 space-y-4 border-l border-border pl-4">
              {selected.timeline.map((e, i) => (
                <li key={i} className="relative">
                  <span className="absolute -left-[21px] top-1 grid h-3 w-3 place-items-center rounded-full border-2 border-background bg-primary" />
                  <div className="text-xs text-muted-foreground">{e.t}</div>
                  <div className="text-sm text-foreground">{e.label}</div>
                </li>
              ))}
            </ol>
          </Card>
        </div>
      </div>
    </>
  );
}

function Row({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </div>
        <div className="truncate text-sm font-medium text-foreground">{value}</div>
      </div>
    </div>
  );
}

function UrgencyBadge({ u }: { u: Urgency }) {
  const map = {
    critical: { label: "Critical · <1h", cls: "bg-primary text-primary-foreground" },
    "within-2h": { label: "Within 2 hrs", cls: "bg-amber-500/15 text-amber-700" },
    today: { label: "Today", cls: "bg-secondary text-foreground" },
  } as const;
  const m = map[u];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${m.cls}`}
    >
      {u === "critical" ? (
        <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-dot" />
      ) : null}
      {m.label}
    </span>
  );
}

function ProofBadge({ p }: { p: Proof }) {
  const map = {
    verified: { label: "Verified", cls: "bg-emerald-500/10 text-emerald-700" },
    pending: { label: "Pending", cls: "bg-amber-500/10 text-amber-700" },
    rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive" },
  } as const;
  const m = map[p];
  return (
    <span className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-semibold ${m.cls}`}>
      {m.label}
    </span>
  );
}

function MatchBadge({ m }: { m: Match }) {
  const map = {
    matching: { label: "Matching · 8 donors", cls: "bg-primary/10 text-primary" },
    matched: { label: "Matched · ETA 22m", cls: "bg-emerald-500/10 text-emerald-700" },
    unmatched: { label: "No match yet", cls: "bg-secondary text-foreground" },
  } as const;
  const v = map[m];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${v.cls}`}>
      <Droplet className="h-3 w-3" /> {v.label}
    </span>
  );
}