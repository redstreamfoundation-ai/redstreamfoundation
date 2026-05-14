import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Check, FileSearch, ShieldCheck, Radio, Phone, Hash, Clock, ArrowRight } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { StepShell } from "@/components/request/StepShell";
import { useRequest } from "@/lib/request-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/request/submitted")({
  component: Submitted,
});

const STEPS = [
  { icon: FileSearch, label: "Submitted", hint: "Request received" },
  { icon: ShieldCheck, label: "Under review", hint: "Coordinator verifying details" },
  { icon: Radio, label: "Donor matching", hint: "Pinging nearby donors" },
  { icon: Check, label: "Donor confirmed", hint: "Awaiting acceptance" },
];

function Submitted() {
  const navigate = useNavigate();
  const { state, update } = useRequest();
  const { user, loading } = useAuth();
  const [stage, setStage] = useState(1); // 0=Submitted (done immediately)
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  // local fallback short ID until DB returns
  const localId = useMemo(
    () => "RS-" + Math.random().toString(36).slice(2, 7).toUpperCase(),
    []
  );
  const requestShortId = (state.requestId ?? localId).slice(0, 8).toUpperCase();

  // Auth gate + DB insert
  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: "/request/submitted" },
        replace: true,
      });
      return;
    }
    if (state.requestId || !state.urgency) return;
    (async () => {
      const { data, error } = await supabase
        .from("blood_requests")
        .insert({
          created_by: user.id,
          blood_group: state.bloodGroup,
          component: state.component,
          units: state.units,
          urgency: state.urgency as "critical" | "within-2h" | "within-24h" | "planned",
          hospital: state.hospital,
          locality: state.locality,
          patient_age: state.patientAge || null,
          attendant_name: state.attendantName || "Attendant",
          attendant_phone: state.attendantPhone,
          proof_uploaded: state.proofUploaded,
          status: "matching",
        })
        .select("id")
        .single();
      if (error) {
        setError(error.message);
        return;
      }
      update({ requestId: data.id });
    })();
  }, [loading, user, state, update, navigate]);

  // Operational timeline progression
  useEffect(() => {
    const timers = [
      setTimeout(() => setStage(2), 2200),
      setTimeout(() => setStage(3), 4400),
      setTimeout(() => setStage(4), 6200),
      setTimeout(() => navigate({ to: "/request/matching" }), 7200),
    ];
    return () => timers.forEach(clearTimeout);
  }, [navigate]);

  // Live elapsed timer
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const submittedAt = useMemo(() => new Date(), []);
  const elapsed = Math.max(0, Math.floor((now - submittedAt.getTime()) / 1000));
  const mm = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const ss = String(elapsed % 60).padStart(2, "0");

  return (
    <StepShell
      eyebrow="Request submitted"
      title="Your emergency request is in the queue."
      subtitle="A coordinator is reviewing your details now. You'll move to live donor matching as soon as verification completes — usually within 2–4 minutes."
      showBack={false}
    >
      {/* Hero card with request ID */}
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-4">
          <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-6 w-6" />
            <span className="absolute -inset-1 rounded-2xl border border-primary/20 animate-pulse-ring" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Request ID
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-base font-semibold text-foreground">
              <Hash className="h-3.5 w-3.5 text-primary" />
              {requestShortId}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Elapsed
            </div>
            <div className="mt-0.5 inline-flex items-center gap-1.5 font-mono text-base text-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              {mm}:{ss}
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <Stat label="Status" value="Verifying" />
          <Stat label="Avg review" value="~ 3 min" />
          <Stat label="Network" value="Delhi NCR" />
        </div>
      </div>

      {/* Operational timeline */}
      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Coordination timeline
        </div>
        <ol className="mt-4 space-y-3">
          {STEPS.map((s, i) => {
            const done = i < stage;
            const active = i === stage;
            return (
              <li
                key={s.label}
                className={`flex items-center gap-4 rounded-2xl border p-3.5 transition-colors ${
                  done
                    ? "border-border bg-card"
                    : active
                    ? "border-primary/40 bg-primary/5"
                    : "border-border bg-card/60"
                }`}
              >
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl transition-colors ${
                    done
                      ? "bg-emerald-500/10 text-emerald-600"
                      : active
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : <s.icon className="h-4 w-4" />}
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">{s.label}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {done ? "Completed" : active ? s.hint : "Pending"}
                  </div>
                </div>
                {active ? (
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
                ) : null}
              </li>
            );
          })}
        </ol>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          Couldn't save your request: {error}
        </div>
      ) : null}

      <a
        href="tel:+911140000000"
        className="mt-6 flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 p-4"
      >
        <div>
          <div className="text-sm font-semibold text-foreground">
            Need help right now?
          </div>
          <div className="text-xs text-muted-foreground">
            Speak to an emergency coordinator on the helpline.
          </div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          <Phone className="h-3.5 w-3.5" /> Call
        </span>
      </a>

      <Link
        to="/request/matching"
        className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full border border-primary/40 bg-card px-6 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
      >
        View status <ArrowRight className="h-4 w-4" />
      </Link>
    </StepShell>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card/80 p-3">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </div>
      <div className="mt-0.5 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}
