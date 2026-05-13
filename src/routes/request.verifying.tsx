import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Check, FileSearch, ShieldCheck, Radio, Phone } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";
import { useRequest } from "@/lib/request-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/request/verifying")({
  component: Verifying,
});

const STEPS = [
  { icon: FileSearch, label: "Reviewing your document" },
  { icon: ShieldCheck, label: "Confirming hospital details" },
  { icon: Radio, label: "Preparing donor network" },
];

function Verifying() {
  const navigate = useNavigate();
  const { state, update } = useRequest();
  const { user, loading } = useAuth();
  const [stage, setStage] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({
        to: "/auth",
        search: { redirect: "/request/verifying" },
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

  useEffect(() => {
    const t1 = setTimeout(() => setStage(1), 1600);
    const t2 = setTimeout(() => setStage(2), 3200);
    const t3 = setTimeout(() => setStage(3), 4800);
    const t4 = setTimeout(() => navigate({ to: "/request/matching" }), 5600);
    return () => [t1, t2, t3, t4].forEach(clearTimeout);
  }, [navigate]);

  return (
    <StepShell
      eyebrow="Verification in progress"
      title="Hold on — we're reviewing your request."
      subtitle="Our coordinators usually verify within 2–4 minutes. You'll be matched with donors right after."
      showBack={false}
    >
      <div className="grid place-items-center py-6">
        <div className="relative h-32 w-32">
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-ring" />
          <span className="absolute inset-3 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:300ms]" />
          <div className="relative grid h-32 w-32 place-items-center rounded-full bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <ShieldCheck className="h-12 w-12" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        {STEPS.map((s, i) => {
          const done = i < stage;
          const active = i === stage;
          return (
            <div
              key={s.label}
              className={`flex items-center gap-4 rounded-2xl border p-4 transition-colors ${
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
                  {done ? "Completed" : active ? "In progress…" : "Pending"}
                </div>
              </div>
              {active ? (
                <span className="h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
              ) : null}
            </div>
          );
        })}
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          Couldn't save your request: {error}
        </div>
      ) : null}

      <a
        href="tel:+911140000000"
        className="mt-8 flex items-center justify-between gap-3 rounded-2xl border border-border bg-secondary/60 p-4"
      >
        <div>
          <div className="text-sm font-semibold text-foreground">Need help right now?</div>
          <div className="text-xs text-muted-foreground">Talk to a coordinator on the helpline.</div>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">
          <Phone className="h-3.5 w-3.5" /> Call
        </span>
      </a>
    </StepShell>
  );
}