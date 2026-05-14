import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
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
} from "lucide-react";
import {
  adminLogin,
  adminListDonors,
  adminListRequests,
  adminUpdateDonorStatus,
  adminUpdateRequestStatus,
  adminGetRequestDetail,
  adminGetStats,
} from "@/lib/admin.functions";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Operations · Redstream Foundation" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
});

const PW_KEY = "redstream_admin_pw";

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
  const [password, setPassword] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return sessionStorage.getItem(PW_KEY);
  });

  if (!password) {
    return <LoginScreen onSuccess={(pw) => {
      sessionStorage.setItem(PW_KEY, pw);
      setPassword(pw);
    }} />;
  }

  return <Dashboard password={password} onLogout={() => {
    sessionStorage.removeItem(PW_KEY);
    setPassword(null);
  }} />;
}

function LoginScreen({ onSuccess }: { onSuccess: (pw: string) => void }) {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    try {
      await adminLogin({ data: { password: pw } });
      onSuccess(pw);
    } catch {
      setErr("Incorrect password.");
    } finally {
      setLoading(false);
    }
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
        <p className="text-sm text-white/60 mb-5">Enter the operations password to continue.</p>
        <input
          type="password"
          autoFocus
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2.5 text-sm outline-none placeholder:text-white/30 focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        {err ? <div className="mt-3 text-xs text-red-400">{err}</div> : null}
        <button
          type="submit"
          disabled={loading || !pw}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-3 py-2.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          Sign in
        </button>
      </form>
    </div>
  );
}

function Dashboard({ password, onLogout }: { password: string; onLogout: () => void }) {
  const [tab, setTab] = useState<"donors" | "requests">("donors");
  const [stats, setStats] = useState<Stats | null>(null);
  const [statsErr, setStatsErr] = useState<string | null>(null);
  const [openRequest, setOpenRequest] = useState<string | null>(null);

  async function loadStats() {
    try {
      const s = await adminGetStats({ data: { password } });
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
          <StatCard label="Total donors" value={stats?.totalDonors} icon={Users} />
          <StatCard label="Pending approvals" value={stats?.pendingDonors} icon={Clock} tone="amber" />
          <StatCard label="Verified donors" value={stats?.approvedDonors} icon={ShieldCheck} tone="emerald" />
          <StatCard label="Total requests" value={stats?.totalRequests} icon={HeartPulse} tone="primary" />
        </div>
        {statsErr ? <p className="mb-4 text-xs text-red-600">{statsErr}</p> : null}

        {/* Tabs */}
        <div className="mb-5 inline-flex rounded-xl border border-border bg-white p-1 shadow-[var(--shadow-soft)]">
          <TabButton active={tab === "donors"} onClick={() => setTab("donors")} icon={Users}>Donors</TabButton>
          <TabButton active={tab === "requests"} onClick={() => setTab("requests")} icon={Inbox}>Patient requests</TabButton>
        </div>

        {tab === "donors" ? (
          <DonorsTab password={password} onChange={loadStats} onUnauthorized={onLogout} />
        ) : openRequest ? (
          <RequestDetail
            password={password}
            id={openRequest}
            onBack={() => setOpenRequest(null)}
            onUnauthorized={onLogout}
          />
        ) : (
          <RequestsTab
            password={password}
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
}: { label: string; value?: number; icon: React.ComponentType<{ className?: string }>; tone?: "primary" | "amber" | "emerald" | "neutral" }) {
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
            {value === undefined ? <span className="text-muted-foreground">—</span> : value}
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

function DonorsTab({ password, onChange, onUnauthorized }: { password: string; onChange: () => void; onUnauthorized: () => void }) {
  const [donors, setDonors] = useState<Donor[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const { donors } = await adminListDonors({ data: { password } });
      setDonors(donors as Donor[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("Unauthorized")) onUnauthorized();
      else setErr(msg);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await adminUpdateDonorStatus({ data: { password, id, status } });
      await load();
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <TableHeader title="Donor signups" count={donors?.length} />
      {err ? <div className="px-5 py-3 text-xs text-red-600">{err}</div> : null}
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>Name</Th><Th>Phone</Th><Th>Blood</Th><Th>Location</Th><Th>Signed up</Th><Th>Status</Th><Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {donors === null ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            ) : donors.length === 0 ? (
              <tr><td colSpan={7} className="px-5 py-8 text-center text-sm text-muted-foreground">No donor signups yet.</td></tr>
            ) : donors.map((d) => (
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
                    onApprove={() => setStatus(d.id, "approved")}
                    onReject={() => setStatus(d.id, "rejected")}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
    </Card>
  );
}

function RequestsTab({
  password, onChange, onOpen, onUnauthorized,
}: { password: string; onChange: () => void; onOpen: (id: string) => void; onUnauthorized: () => void }) {
  const [rows, setRows] = useState<RequestRow[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function load() {
    try {
      const { requests } = await adminListRequests({ data: { password } });
      setRows(requests as RequestRow[]);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load";
      if (msg.includes("Unauthorized")) onUnauthorized();
      else setErr(msg);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function setStatus(id: string, status: "approved" | "rejected") {
    setBusyId(id);
    try {
      await adminUpdateRequestStatus({ data: { password, id, status } });
      await load();
      onChange();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <Card>
      <TableHeader title="Patient requests" count={rows?.length} />
      {err ? <div className="px-5 py-3 text-xs text-red-600">{err}</div> : null}
      <TableScroll>
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <tr>
              <Th>Patient contact</Th><Th>Blood</Th><Th>Hospital</Th><Th>Phone</Th><Th>Units</Th><Th>Submitted</Th><Th>Status</Th><Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows === null ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto h-4 w-4 animate-spin" /></td></tr>
            ) : rows.length === 0 ? (
              <tr><td colSpan={8} className="px-5 py-8 text-center text-sm text-muted-foreground">No patient requests yet.</td></tr>
            ) : rows.map((r) => (
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
                    onApprove={() => setStatus(r.id, "approved")}
                    onReject={() => setStatus(r.id, "rejected")}
                  />
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableScroll>
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
  password, id, onBack, onUnauthorized,
}: { password: string; id: string; onBack: () => void; onUnauthorized: () => void }) {
  const [data, setData] = useState<RequestDetailData | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminGetRequestDetail({ data: { password, id } });
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