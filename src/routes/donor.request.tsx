import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Check, Clock, MapPin, X, Calendar, Droplet, Building2, Navigation, BellRing } from "lucide-react";
import { useEffect, useState } from "react";
import { StepShell } from "@/components/request/StepShell";
import { useDonor } from "@/lib/donor-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/donor/request")({
  component: IncomingRequest,
  head: () => ({
    meta: [
      { title: "Incoming blood request — Redstream Foundation" },
      {
        name: "description",
        content:
          "Review an incoming verified emergency blood request: hospital area, distance, urgency, and availability match.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function IncomingRequest() {
  const navigate = useNavigate();
  const { state, update } = useDonor();
  const { user, loading } = useAuth();
  const [laterOpen, setLaterOpen] = useState(false);
  const [confirmDecline, setConfirmDecline] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(state.activeRequestId);

  useEffect(() => {
    if (loading || !user || requestId) return;
    (async () => {
      const { data } = await supabase
        .from("blood_requests")
        .select("id")
        .in("status", ["pending", "matching"])
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data) {
        setRequestId(data.id);
        update({ activeRequestId: data.id });
      }
    })();
  }, [loading, user, requestId, update]);

  const recordMatch = async (decision: "accepted" | "declined" | "later", inHours?: number) => {
    if (!user || !requestId) return;
    await supabase.from("request_matches").upsert(
      {
        request_id: requestId,
        donor_user_id: user.id,
        decision,
        available_in_hours: inHours ?? null,
      },
      { onConflict: "request_id,donor_user_id" },
    );
  };

  const accept = () => {
    void recordMatch("accepted");
    update({ lastDecision: { kind: "accepted", at: Date.now() } });
    navigate({ to: "/donor/coordinate" });
  };
  const decline = () => {
    void recordMatch("declined");
    update({ lastDecision: { kind: "declined", at: Date.now() } });
    navigate({ to: "/donor/dashboard" });
  };
  const scheduleLater = (inHours: number) => {
    void recordMatch("later", inHours);
    update({ lastDecision: { kind: "later", at: Date.now(), inHours } });
    navigate({ to: "/donor/dashboard" });
  };

  return (
    <StepShell
      eyebrow="Incoming emergency"
      title="A patient near you needs help."
      subtitle="This request has been verified by Redstream coordinators. Take a moment — no pressure."
      footer={
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setConfirmDecline(true)}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <X className="h-4 w-4" /> Not available
          </button>
          <button
            onClick={accept}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-4 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] hover:bg-[var(--primary-deep)]"
          >
            <Check className="h-4 w-4" /> Accept request
          </button>
        </div>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-primary/30 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
              <Droplet className="h-5 w-5" />
            </div>
            <div>
              <div className="font-serif-display text-3xl text-foreground">B+</div>
              <div className="text-xs text-muted-foreground">2 units · Whole blood</div>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold text-primary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-background animate-pulse-dot" />
            Critical
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat icon={Building2} label="Hospital" value="Sir Ganga Ram" />
          <Stat icon={MapPin} label="Distance" value="2.4 km" />
          <Stat icon={Clock} label="Needed by" value="In 1 hour" />
          <Stat icon={Navigation} label="Drive time" value="~ 12 min" />
        </div>
      </div>

      {/* Match indicator */}
      <div className="mt-5 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <Check className="h-4 w-4" />
        </div>
        <div className="text-sm leading-relaxed text-foreground">
          You're a strong match — same blood group, within your radius, and inside
          your active hours.
        </div>
      </div>

      {/* Patient context */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Patient
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="text-foreground">47-year-old, post-surgery</span>
          <span className="text-muted-foreground">Rajinder Nagar</span>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Identifying details are kept minimal until you accept. Patient contact is
          shared via masked relay only.
        </p>
      </div>

      {/* Available later */}
      <button
        onClick={() => setLaterOpen((v) => !v)}
        className="mt-5 flex w-full items-center justify-between rounded-2xl border border-border bg-secondary/60 p-4 text-left transition-colors hover:bg-secondary"
      >
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">Available later</div>
            <div className="text-xs text-muted-foreground">
              I can help in 2 — 4 hours
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-primary">{laterOpen ? "Hide" : "Choose time"}</span>
      </button>

      {laterOpen ? (
        <div className="mt-3 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] animate-slide-up">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            <BellRing className="h-3.5 w-3.5 text-primary" /> Remind me in
          </div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 2, 4, 8].map((h) => (
              <button
                key={h}
                onClick={() => scheduleLater(h)}
                className="rounded-xl border border-border bg-background py-3 text-sm font-semibold text-foreground transition-all hover:border-primary/40 hover:bg-primary/5"
              >
                {h}h
              </button>
            ))}
          </div>
          <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
            We'll reach out again only if this request is still open. You won't be
            pinged for unrelated requests during this window.
          </p>
        </div>
      ) : null}

      {confirmDecline ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-foreground/30 backdrop-blur-sm px-5"
          onClick={() => setConfirmDecline(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-3xl border border-border bg-card p-6 shadow-[var(--shadow-elevated)] animate-slide-up"
          >
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-secondary text-muted-foreground">
              <X className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-foreground">
              Mark as not available?
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              We'll quietly route this to the next nearest donor. No penalty — your
              status stays active.
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => setConfirmDecline(false)}
                className="rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
              >
                Go back
              </button>
              <button
                onClick={decline}
                className="rounded-full bg-foreground px-4 py-3 text-sm font-medium text-background"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </StepShell>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-background p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="mt-1 text-base font-semibold text-foreground">{value}</div>
    </div>
  );
}