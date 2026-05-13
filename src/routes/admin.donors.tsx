import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Filter, Star, Phone, MoreHorizontal } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/donors")({
  component: DonorNetwork,
});

const GROUPS = ["All", "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const ZONES = ["All zones", "Rajinder Nagar", "Saket", "Dwarka", "Karol Bagh", "Pitampura"];

type Status = "active" | "paused" | "donating";
type Row = {
  id: string;
  name: string;
  group: string;
  zone: string;
  status: Status;
  reliability: number;
  donations: number;
  last: string;
};

const ROWS: Row[] = [
  { id: "DR-001", name: "Aarav Mehta", group: "B+", zone: "Rajinder Nagar", status: "active", reliability: 98, donations: 12, last: "62d ago" },
  { id: "DR-002", name: "Riya Kapoor", group: "O-", zone: "Saket", status: "donating", reliability: 96, donations: 9, last: "today" },
  { id: "DR-003", name: "Mohit Yadav", group: "A+", zone: "Dwarka", status: "active", reliability: 91, donations: 7, last: "94d ago" },
  { id: "DR-004", name: "Sana Khan", group: "AB+", zone: "Karol Bagh", status: "paused", reliability: 88, donations: 5, last: "180d ago" },
  { id: "DR-005", name: "Karan Singh", group: "B-", zone: "Pitampura", status: "active", reliability: 99, donations: 14, last: "120d ago" },
  { id: "DR-006", name: "Neha Verma", group: "O+", zone: "Saket", status: "active", reliability: 94, donations: 8, last: "75d ago" },
  { id: "DR-007", name: "Rohit Sharma", group: "A-", zone: "Rajinder Nagar", status: "paused", reliability: 82, donations: 3, last: "210d ago" },
  { id: "DR-008", name: "Tanvi Joshi", group: "B+", zone: "Dwarka", status: "active", reliability: 97, donations: 11, last: "100d ago" },
];

function DonorNetwork() {
  const [q, setQ] = useState("");
  const [group, setGroup] = useState("All");
  const [zone, setZone] = useState("All zones");

  const list = useMemo(
    () =>
      ROWS.filter(
        (r) =>
          (group === "All" || r.group === group) &&
          (zone === "All zones" || r.zone === zone) &&
          (q === "" ||
            r.name.toLowerCase().includes(q.toLowerCase()) ||
            r.id.toLowerCase().includes(q.toLowerCase()))
      ),
    [q, group, zone]
  );

  return (
    <>
      <PageHeader
        eyebrow="Network"
        title="Donor directory"
        subtitle={`${ROWS.length} verified donors · 1,284 in extended pool`}
        actions={
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
            Export CSV
          </button>
        }
      />

      <Card className="overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or ID"
              className="h-10 w-full rounded-lg border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <Select value={group} onChange={setGroup} options={GROUPS} />
          <Select value={zone} onChange={setZone} options={ZONES} />
          <button className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2.5 text-xs font-semibold text-foreground hover:bg-secondary">
            <Filter className="h-3.5 w-3.5" /> More filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="bg-secondary/40 text-left text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                <th className="px-5 py-3">Donor</th>
                <th className="px-3 py-3">Group</th>
                <th className="px-3 py-3">Zone</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-3 py-3">Reliability</th>
                <th className="px-3 py-3">Donations</th>
                <th className="px-3 py-3">Last donation</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {list.map((r) => (
                <tr key={r.id} className="hover:bg-secondary/30">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-[var(--gradient-emergency)] text-[11px] font-semibold text-white">
                        {r.name
                          .split(" ")
                          .map((p) => p[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <div className="font-medium text-foreground">{r.name}</div>
                        <div className="text-[11px] text-muted-foreground">{r.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      {r.group}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted-foreground">{r.zone}</td>
                  <td className="px-3 py-3">
                    <StatusPill s={r.status} />
                  </td>
                  <td className="px-3 py-3">
                    <ReliabilityBar v={r.reliability} />
                  </td>
                  <td className="px-3 py-3 text-foreground">{r.donations}</td>
                  <td className="px-3 py-3 text-muted-foreground">{r.last}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        aria-label="Call"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"
                      >
                        <Phone className="h-3.5 w-3.5 text-foreground" />
                      </button>
                      <button
                        aria-label="More"
                        className="grid h-8 w-8 place-items-center rounded-lg border border-border hover:bg-secondary"
                      >
                        <MoreHorizontal className="h-3.5 w-3.5 text-foreground" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

function StatusPill({ s }: { s: Status }) {
  const map = {
    active: { l: "Active", cls: "bg-emerald-500/10 text-emerald-700" },
    donating: { l: "Donating now", cls: "bg-primary/10 text-primary" },
    paused: { l: "Paused", cls: "bg-secondary text-muted-foreground" },
  } as const;
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ${map[s].cls}`}>
      {map[s].l}
    </span>
  );
}

function ReliabilityBar({ v }: { v: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-secondary">
        <div
          className="h-full rounded-full bg-[var(--gradient-emergency)]"
          style={{ width: `${v}%` }}
        />
      </div>
      <span className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
        <Star className="h-3 w-3 text-amber-500" /> {v}
      </span>
    </div>
  );
}