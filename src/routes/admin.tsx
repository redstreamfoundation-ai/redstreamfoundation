import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Droplet,
  ShieldCheck,
  LogOut,
  Users,
  Inbox,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
  Phone,
  MapPin,
  Building2,
  Clock,
  HeartPulse,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  ScrollText,
  Pencil,
  Trash2,
  X,
} from "lucide-react";
import {
  adminListDonors,
  adminListRequests,
  adminUpdateDonorStatus,
  adminUpdateRequestStatus,
  adminGetRequestDetail,
  adminGetStats,
  adminListAudit,
  adminUpdateDonor,
  adminDeleteDonor,
} from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Operations · Redstream Foundation" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

type Donor = {
  id: string;
  full_name: string;
  phone: string;
  blood_group: string;
  locality: string;
  pincode: string;
  status: string;
  verified: boolean;
  created_at: string;
  last_donation_date: string | null;
};

type RequestRow = {
  id: string;
  attendant_name: string;
  attendant_phone: string;
  blood_group: string;
  hospital: string;
  locality: string;
  units: number;
  urgency: string;
  component: string;
  patient_age: string | null;
  status: string;
  admin_status: string;
  created_at: string;
};

type Stats = {
  totalDonors: number;
  pendingDonors: number;
  approvedDonors: number;
  totalRequests: number;
  pendingRequests: number;
};

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen bg-[oklch(0.16_0.025_25)] grid place-items-center">
        <Loader2 className="h-6 w-6 animate-spin text-white/50" />
      </div>
    );
  }

  if (!session) {
    return <LoginScreen />;
  }

  return <Dashboard onLogout={async () => { await supabase.auth.signOut(); }} />;
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
    if (error) setErr(error.message);
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-[oklch(0.16_0.025_25)] text-white grid place-items-center p-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.03] p-7 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-2.5 mb-6">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow)]">
            <Droplet className="h-4 w-4 text-white" />
          </span>
          <div className="leading-tight">
            <div className="font-serif-display text-lg">Redstream</div>
            <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Operations</div>
          </div>
        </div>
        <h1 className="text-xl font-semibold mb-1">Admin access</h1>
        <p className="text-sm text-white/60 mb-5">Sign in with your operations email.</p>
        <input
          type="email"
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20 mb-3"
        />
        <input
          type="password"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          required
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {err ? <div className="mt-3 text-xs text-red-400">{err}</div> : null}
        <button
          type="submit"
          disabled={loading || !pw || !email}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState<"donors" | "requests" | "audit">("donors");
  const [stats, setStats] = useState<Stats>({
    totalDonors: 0,
    pendingDonors: 0,
    approvedDonors: 0,
    totalRequests: 0,
    pendingRequests: 0,
  });
  const [statsErr, setStatsErr] = useState<string | null>(null);
  const [openRequest, setOpenRequest] = useState<string | null>(null);

  async function loadStats() {
    try {
      const s = await adminGetStats({});
      setStats(s);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load stats";
      if (msg.includes("Unauthorized")) onLogout();
      else setStatsErr(msg);
    }
  }

  useEffect(() => { loadStats(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.005_25)]">
      <header className="border-b border-border bg-[oklch(0.16_0.025_25)] text-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow)]">
              <Droplet className="h-4 w-4 text-white" />
            </span>
            <div className="leading-tight">
              <div className="font-serif-display text-lg">Redstream</div>
              <div className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">Operations</div>
            </div>
          </div>
          <button
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-7">
        {/* Stats */}
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 mb-6">
          <StatCard label="Total donors" value={stats.totalDonors} icon={Users} />
          <StatCard label="Pending approvals" value={stats.pendingDonors} icon={Clock} tone="amber" />
          <StatCard label="Verified donors" value={stats.approvedDonors} icon={ShieldCheck} tone="emerald" />
          <StatCard label="Total requests" value={stats.totalRequests} icon={HeartPulse} tone="primary" />
        </div>
        {statsErr ? <p className="mb-4 text-xs text-red-600">{statsErr}</p> : null}

        {/* Tabs */}
        <div className="mb-5 inline-flex rounded-xl border border-border bg-white p-1 shadow-[var(--shadow-soft)]">
          <TabButton active={tab === "donors"} onClick={() => setTab("donors")} icon={Users}>Donors</TabButton>
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")} icon={Inbox}>Patient requests</TabButton>
          <TabButton active={tab === "audit"} onClick={() => setTab("audit")} icon={ScrollText}>Audit log</TabButton>
        </div>

        {tab === "donors" ? (
          <DonorsTab onChange={loadStats} onUnauthorized={onLogout} />
        ) : tab === "audit" ? (
          <AuditTab onUnauthorized={onLogout} />
        ) : openRequest ? (
          <RequestDetail
            
            id={openRequest}
            onBack={() => setOpenRequest(null)}
            onUnauthorized={onLogout}
          />
        ) : (
          <RequestsTab
            
            onChange={loadStats}
            onOpen={(id) => setOpenRequest(id)}
            onUnauthorized={onLogout}
          />
        )}
      </main>
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, tone = "neutral",
}: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "amber" | "emerald" | "neutral" }) {
  const map = {
    primary: "bg-primary/10 text-primary",
    amber: "bg-amber-500/10 text-amber-600",
    emerald: "bg-emerald-500/10 text-emerald-600",
    neutral: "bg-secondary text-foreground",
  } as const;
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-2 font-serif-display text-3xl text-foreground">
            {value}
          </div>
        </div>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${map[tone]}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}

function TabButton({
  active, onClick, icon: Icon, children,
}: { active: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        active ? "bg-[oklch(0.16_0.025_25)] text-white" : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <Icon className="h-4 w-4" />
      {children}
    </button>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-700 border-amber-500/20",
    approved: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
    rejected: "bg-red-500/10 text-red-700 border-red-500/20",
  };
  return (
    <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${map[status] || "bg-secondary text-muted-foreground border-border"}`}>
      {status}
    </span>
  );
}

function ActionButtons({
  status, onApprove, onReject, busy,
}: { status: string; onApprove: () => void; onReject: () => void; busy: boolean }) {
  if (status !== "pending") {
    return (
      <button
        onClick={status === "approved" ? onReject : onApprove}
        disabled={busy}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
      >
        {status === "approved" ? "Mark rejected" : "Mark approved"}
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5">
      <button
        onClick={onApprove}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
      >
        <CheckCircle2 className="h-3 w-3" /> Approve
      </button>
      <button
        onClick={onReject}
        disabled={busy}
        className="inline-flex items-center gap-1 rounded-md border border-border bg-white px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-secondary disabled:opacity-50"
      >
        <XCircle className="h-3 w-3" /> Reject
      </button>
    </div>
  );
}

function fmtDate(s: string) {
  try { return new Date(s).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }); } catch { return s; }
}

const BLOOD_GROUPS = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"];
const PAGE_SIZES = [10, 25, 50, 100];

type SortDir = "asc" | "desc";

function DonorsTab({ onChange, onUnauthorized }: { onChange: () => void; onUnauthorized: () => void }) {
  const [donors, setDonors] = useState<Donor[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [bg, setBg] = useState("all");
  const [locality, setLocality] = useState("");
  const [status, setStatus] = useState("all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [sortKey, setSortKey] = useState<keyof Donor>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  async function load() {
    try {
      const { donors } = await adminListDonors({});
      setDonors(donors as Donor[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("Unauthorized")) onUnauthorized();
      else setErr(msg);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function setDonorStatus(id: string, next: "approved" | "rejected") {
    setBusyId(id);
    try {
      await adminUpdateDonorStatus({ data: { id, status: next } });
      await load();
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!donors) return null;
    const q = search.trim().toLowerCase();
    const loc = locality.trim().toLowerCase();
    const fromTs = from ? new Date(from).getTime() : null;
    const toTs = to ? new Date(to).getTime() + 24 * 3600 * 1000 - 1 : null;
    const rows = donors.filter((d) => {
      if (q && !`${d.full_name} ${d.phone} ${d.locality} ${d.pincode}`.toLowerCase().includes(q)) return false;
      if (bg !== "all" && d.blood_group !== bg) return false;
      if (status !== "all" && d.status !== status) return false;
      if (loc && !d.locality.toLowerCase().includes(loc)) return false;
      const ts = new Date(d.created_at).getTime();
      if (fromTs && ts < fromTs) return false;
      if (toTs && ts > toTs) return false;
      return true;
    });
    rows.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const r = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? r : -r;
    });
    return rows;
  }, [donors, search, bg, locality, status, from, to, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, bg, locality, status, from, to, pageSize]);

  function toggleSort(key: keyof Donor) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const total = filtered?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = filtered ? filtered.slice((page - 1) * pageSize, page * pageSize) : null;

  return (
    <Card>
      <TableHeader title="Donor signups" count={total} />
      <div className="grid gap-2 border-b border-border bg-secondary/30 px-5 py-3 sm:grid-cols-2 lg:grid-cols-6">
        <div className="lg:col-span-2 relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, locality…"
            className="w-full rounded-md border border-border bg-white pl-8 pr-2 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
        <FilterSelect value={bg} onChange={setBg} label="Blood">
          <option value="all">All blood</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </FilterSelect>
        <FilterSelect value={status} onChange={setStatus} label="Status">
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>
        <input
          value={locality}
          onChange={(e) => setLocality(e.target.value)}
          placeholder="Locality"
          className="rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-primary"
        />
        <div className="flex items-center gap-1">
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-primary" />
          <span className="text-xs text-muted-foreground">–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="w-full rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-primary" />
        </div>
      </div>
      {err ? <div className="px-5 py-3 text-xs text-red-600">{err}</div> : null}
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <SortTh label="Name" col="full_name" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("full_name")} />
              <Th>Phone</Th>
              <SortTh label="Blood" col="blood_group" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("blood_group")} />
              <SortTh label="Location" col="locality" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("locality")} />
              <SortTh label="Signed up" col="created_at" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("created_at")} />
              <SortTh label="Status" col="status" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("status")} />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows === null ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No donors match these filters.</td></tr>
            ) : pageRows.map((d) => (
              <tr key={d.id} className="hover:bg-secondary/40">
                <Td className="font-medium text-foreground">{d.full_name}</Td>
                <Td>{d.phone}</Td>
                <Td><span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">{d.blood_group}</span></Td>
                <Td>{[d.locality, d.pincode].filter(Boolean).join(", ")}</Td>
                <Td className="text-muted-foreground">{fmtDate(d.created_at)}</Td>
                <Td><StatusBadge status={d.status} /></Td>
                <Td className="text-right">
                  <ActionButtons
                    status={d.status}
                    busy={busyId === d.id}
                    onApprove={() => setDonorStatus(d.id, "approved")}
                    onReject={() => setDonorStatus(d.id, "rejected")}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} total={total} onPage={setPage} onPageSize={setPageSize} />
    </Card>
  );
}

function RequestsTab({
  onChange, onOpen, onUnauthorized,
}: { onChange: () => void; onOpen: (id: string) => void; onUnauthorized: () => void }) {
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [bg, setBg] = useState("all");
  const [hospital, setHospital] = useState("");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<keyof RequestRow>("created_at");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  async function load() {
    try {
      const { requests } = await adminListRequests({});
      setRows(requests as RequestRow[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("Unauthorized")) onUnauthorized();
      else setErr(msg);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function setReqStatus(id: string, next: "approved" | "rejected") {
    setBusyId(id);
    try {
      await adminUpdateRequestStatus({ data: { id, status: next } });
      await load();
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  const filtered = useMemo(() => {
    if (!rows) return null;
    const q = search.trim().toLowerCase();
    const hosp = hospital.trim().toLowerCase();
    const out = rows.filter((r) => {
      if (q && !`${r.attendant_name} ${r.attendant_phone} ${r.hospital} ${r.locality}`.toLowerCase().includes(q)) return false;
      if (bg !== "all" && r.blood_group !== bg) return false;
      if (hosp && !r.hospital.toLowerCase().includes(hosp)) return false;
      if (status !== "all" && r.admin_status !== status) return false;
      return true;
    });
    out.sort((a, b) => {
      const av = a[sortKey] ?? "";
      const bv = b[sortKey] ?? "";
      const r = String(av).localeCompare(String(bv), undefined, { numeric: true });
      return sortDir === "asc" ? r : -r;
    });
    return out;
  }, [rows, search, bg, hospital, status, sortKey, sortDir]);

  useEffect(() => { setPage(1); }, [search, bg, hospital, status, pageSize]);

  function toggleSort(key: keyof RequestRow) {
    if (sortKey === key) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  }

  const total = filtered?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = filtered ? filtered.slice((page - 1) * pageSize, page * pageSize) : null;

  return (
    <Card>
      <TableHeader title="Patient requests" count={total} />
      <div className="grid gap-2 border-b border-border bg-secondary/30 px-5 py-3 sm:grid-cols-2 lg:grid-cols-5">
        <div className="lg:col-span-2 relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, phone, hospital…"
            className="w-full rounded-md border border-border bg-white pl-8 pr-2 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
        <FilterSelect value={status} onChange={setStatus} label="Status">
          <option value="all">All status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </FilterSelect>
        <FilterSelect value={bg} onChange={setBg} label="Blood">
          <option value="all">All blood</option>
          {BLOOD_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
        </FilterSelect>
        <input
          value={hospital}
          onChange={(e) => setHospital(e.target.value)}
          placeholder="Hospital"
          className="rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-primary"
        />
      </div>
      {err ? <div className="px-5 py-3 text-xs text-red-600">{err}</div> : null}
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <SortTh label="Patient contact" col="attendant_name" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("attendant_name")} />
              <SortTh label="Blood" col="blood_group" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("blood_group")} />
              <SortTh label="Hospital" col="hospital" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("hospital")} />
              <Th>Phone</Th>
              <SortTh label="Units" col="units" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("units")} />
              <SortTh label="Submitted" col="created_at" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("created_at")} />
              <SortTh label="Status" col="admin_status" sortKey={sortKey} sortDir={sortDir} onSort={() => toggleSort("admin_status")} />
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows === null ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">No requests match these filters.</td></tr>
            ) : pageRows.map((r) => (
              <tr
                key={r.id}
                onClick={() => r.admin_status === "approved" && onOpen(r.id)}
                className={`hover:bg-secondary/40 ${r.admin_status === "approved" ? "cursor-pointer" : ""}`}
              >
                <Td className="font-medium text-foreground">{r.attendant_name}</Td>
                <Td><span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">{r.blood_group}</span></Td>
                <Td>{r.hospital}</Td>
                <Td>{r.attendant_phone}</Td>
                <Td>{r.units}</Td>
                <Td className="text-muted-foreground">{fmtDate(r.created_at)}</Td>
                <Td><StatusBadge status={r.admin_status} /></Td>
                <Td className="text-right" onClick={(e) => e.stopPropagation()}>
                  <ActionButtons
                    status={r.admin_status}
                    busy={busyId === r.id}
                    onApprove={() => setReqStatus(r.id, "approved")}
                    onReject={() => setReqStatus(r.id, "rejected")}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} total={total} onPage={setPage} onPageSize={setPageSize} />
      {rows && rows.some((r) => r.admin_status === "approved") ? (
        <div className="border-t border-border px-5 py-2.5 text-[11px] text-muted-foreground">
          Tip: click any approved request to view matched donors.
        </div>
      ) : null}
    </Card>
  );
}

type RequestDetailData = {
  request: RequestRow & { created_by?: string | null };
  matches: Array<{ id: string; full_name: string; phone: string; blood_group: string; locality: string; pincode: string }>;
};

function RequestDetail({
  id, onBack, onUnauthorized,
}: { id: string; onBack: () => void; onUnauthorized: () => void }) {
  const [data, setData] = useState<RequestDetailData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetRequestDetail({ data: { id } });
        setData(res as RequestDetailData);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load";
        if (msg.includes("Unauthorized")) onUnauthorized();
        else setErr(msg);
      }
    })();
    // eslint-disable-next-line
  }, [id]);

  return (
    <div>
      <button onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Back to requests
      </button>

      {err ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{err}</div> : null}
      {!data ? (
        <div className="grid place-items-center py-16"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <>
          <Card className="mb-6">
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Patient request</h2>
              <StatusBadge status={data.request.admin_status} />
            </div>
            <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="Attendant name" value={data.request.attendant_name} />
              <Field label="Attendant phone" value={data.request.attendant_phone} icon={Phone} />
              <Field label="Blood group" value={data.request.blood_group} highlight />
              <Field label="Component" value={data.request.component} />
              <Field label="Units required" value={String(data.request.units)} />
              <Field label="Urgency" value={data.request.urgency} />
              <Field label="Patient age" value={data.request.patient_age || "—"} />
              <Field label="Hospital" value={data.request.hospital} icon={Building2} />
              <Field label="Locality" value={data.request.locality} icon={MapPin} />
              <Field label="Submitted" value={fmtDate(data.request.created_at)} icon={Clock} />
              <Field label="Operational status" value={data.request.status} />
            </div>
          </Card>

          <Card>
            <div className="border-b border-border px-5 py-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-foreground">Matched donors</h2>
              <span className="text-[11px] text-muted-foreground">
                {data.matches.length} verified · sorted by proximity
              </span>
            </div>
            <TableScroll>
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <tr><Th>Name</Th><Th>Phone</Th><Th>Blood</Th><Th>Location</Th></tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.matches.length === 0 ? (
                    <tr><td colSpan={4} className="px-5 py-8 text-center text-sm text-muted-foreground">No verified donors match this blood group yet.</td></tr>
                  ) : data.matches.map((d) => (
                    <tr key={d.id} className="hover:bg-secondary/40">
                      <Td className="font-medium text-foreground">{d.full_name}</Td>
                      <Td>
                        <a href={`tel:${d.phone}`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          <Phone className="h-3 w-3" /> {d.phone}
                        </a>
                      </Td>
                      <Td><span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-[11px] font-bold text-primary">{d.blood_group}</span></Td>
                      <Td>{[d.locality, d.pincode].filter(Boolean).join(", ")}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </TableScroll>
          </Card>
        </>
      )}
    </div>
  );
}

function Field({
  label, value, icon: Icon, highlight,
}: { label: string; value: string; icon?: React.ComponentType<{ className?: string }>; highlight?: boolean }) {
  return (
    <div>
      <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`mt-1 flex items-center gap-1.5 ${highlight ? "font-bold text-primary text-base" : "text-sm text-foreground"}`}>
        {Icon ? <Icon className="h-3.5 w-3.5 text-muted-foreground" /> : null}
        <span>{value}</span>
      </div>
    </div>
  );
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] overflow-hidden ${className}`}>{children}</div>;
}
function TableScroll({ children }: { children: React.ReactNode }) {
  return <div className="overflow-x-auto">{children}</div>;
}
function TableHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-center justify-between border-b border-border px-5 py-4">
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      {count !== undefined ? <span className="text-[11px] text-muted-foreground">{count} total</span> : null}
    </div>
  );
}
function Th({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <th className={`px-5 py-3 text-left ${className}`}>{children}</th>;
}
function Td({ children, className = "", onClick }: { children: React.ReactNode; className?: string; onClick?: (e: React.MouseEvent) => void }) {
  return <td onClick={onClick} className={`px-5 py-3 text-sm text-foreground ${className}`}>{children}</td>;
}

function FilterSelect({
  value, onChange, label, children,
}: { value: string; onChange: (v: string) => void; label: string; children: React.ReactNode }) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-md border border-border bg-white px-2 py-1.5 text-xs outline-none focus:border-primary"
    >
      {children}
    </select>
  );
}

function SortTh<T extends string>({
  label, col, sortKey, sortDir, onSort,
}: { label: string; col: T; sortKey: string; sortDir: SortDir; onSort: () => void }) {
  const active = sortKey === col;
  const Icon = !active ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;
  return (
    <th className="px-5 py-3 text-left">
      <button onClick={onSort} className={`inline-flex items-center gap-1 ${active ? "text-foreground" : ""}`}>
        {label}
        <Icon className="h-3 w-3" />
      </button>
    </th>
  );
}

function Pagination({
  page, pageCount, pageSize, total, onPage, onPageSize,
}: { page: number; pageCount: number; pageSize: number; total: number; onPage: (n: number) => void; onPageSize: (n: number) => void }) {
  const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-2.5 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <span>Rows per page:</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSize(Number(e.target.value))}
          className="rounded-md border border-border bg-white px-1.5 py-1 text-xs outline-none focus:border-primary"
        >
          {PAGE_SIZES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex items-center gap-3">
        <span>{start}–{end} of {total}</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPage(Math.max(1, page - 1))}
            disabled={page <= 1}
            className="grid h-7 w-7 place-items-center rounded-md border border-border bg-white disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <span className="px-1">{page} / {pageCount}</span>
          <button
            onClick={() => onPage(Math.min(pageCount, page + 1))}
            disabled={page >= pageCount}
            className="grid h-7 w-7 place-items-center rounded-md border border-border bg-white disabled:opacity-40"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

type AuditEntry = {
  id: string;
  action: string;
  target_type: string;
  target_id: string;
  target_label: string | null;
  actor: string;
  created_at: string;
};

function AuditTab({ onUnauthorized }: { onUnauthorized: () => void }) {
  const [entries, setEntries] = useState<AuditEntry[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [action, setAction] = useState("all");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  useEffect(() => {
    (async () => {
      try {
        const { entries } = await adminListAudit({ data: { limit: 1000 } });
        setEntries(entries as AuditEntry[]);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Failed to load";
        if (msg.includes("Unauthorized")) onUnauthorized();
        else setErr(msg);
      }
    })();
    // eslint-disable-next-line
  }, []);

  const filtered = useMemo(() => {
    if (!entries) return null;
    const q = search.trim().toLowerCase();
    return entries.filter((e) => {
      if (q && !`${e.target_label ?? ""} ${e.actor}`.toLowerCase().includes(q)) return false;
      if (type !== "all" && e.target_type !== type) return false;
      if (action !== "all" && e.action !== action) return false;
      return true;
    });
  }, [entries, search, type, action]);

  useEffect(() => { setPage(1); }, [search, type, action, pageSize]);

  const total = filtered?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const pageRows = filtered ? filtered.slice((page - 1) * pageSize, page * pageSize) : null;

  return (
    <Card>
      <TableHeader title="Audit log" count={total} />
      <div className="grid gap-2 border-b border-border bg-secondary/30 px-5 py-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2 relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search target or actor…"
            className="w-full rounded-md border border-border bg-white pl-8 pr-2 py-1.5 text-xs outline-none focus:border-primary"
          />
        </div>
        <FilterSelect value={type} onChange={setType} label="Target type">
          <option value="all">All types</option>
          <option value="donor">Donors</option>
          <option value="request">Requests</option>
        </FilterSelect>
        <FilterSelect value={action} onChange={setAction} label="Action">
          <option value="all">All actions</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="pending">Reset to pending</option>
        </FilterSelect>
      </div>
      {err ? <div className="px-5 py-3 text-xs text-red-600">{err}</div> : null}
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>When</Th><Th>Actor</Th><Th>Action</Th><Th>Type</Th><Th>Target</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {pageRows === null ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            ) : pageRows.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No audit entries yet.</td></tr>
            ) : pageRows.map((e) => (
              <tr key={e.id} className="hover:bg-secondary/40">
                <Td className="text-muted-foreground whitespace-nowrap">{fmtDate(e.created_at)}</Td>
                <Td className="font-medium text-foreground">{e.actor}</Td>
                <Td><StatusBadge status={e.action} /></Td>
                <Td className="capitalize">{e.target_type}</Td>
                <Td>{e.target_label || <span className="text-muted-foreground">{e.target_id.slice(0, 8)}…</span>}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
      <Pagination page={page} pageCount={pageCount} pageSize={pageSize} total={total} onPage={setPage} onPageSize={setPageSize} />
    </Card>
  );
}