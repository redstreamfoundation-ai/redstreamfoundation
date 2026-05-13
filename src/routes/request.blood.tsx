import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Minus, Plus, ChevronRight, Droplet, Zap, Clock, Calendar } from "lucide-react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useRequest, type Urgency } from "@/lib/request-store";

export const Route = createFileRoute("/request/blood")({
  component: BloodStep,
});

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];
const COMPONENTS = ["Whole Blood", "Platelets", "Plasma", "PRBC"];
const URGENCIES: { id: Urgency; label: string; hint: string; icon: typeof Zap }[] = [
  { id: "critical", label: "Critical", hint: "Within 1 hour", icon: Zap },
  { id: "within-2h", label: "Very urgent", hint: "Within 2 hours", icon: Clock },
  { id: "within-24h", label: "Urgent", hint: "Within 24 hours", icon: Clock },
  { id: "planned", label: "Scheduled", hint: "Next 1–3 days", icon: Calendar },
];

function BloodStep() {
  const { state, update } = useRequest();
  const navigate = useNavigate();
  const valid = state.bloodGroup && state.urgency && state.units > 0;

  return (
    <StepShell
      step={1}
      eyebrow="Blood requirement"
      title="What does the patient need?"
      subtitle="The more accurate this is, the better we can match the right donors."
      footer={
        <PrimaryButton
          disabled={!valid}
          onClick={() => navigate({ to: "/request/hospital" })}
        >
          Continue <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      <section>
        <Label>Blood group</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GROUPS.map((g) => {
            const active = state.bloodGroup === g;
            return (
              <button
                key={g}
                onClick={() => update({ bloodGroup: g })}
                className={`group flex flex-col items-center gap-1 rounded-2xl border px-3 py-4 text-sm font-semibold transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                <Droplet className={`h-4 w-4 ${active ? "" : "text-primary"}`} />
                {g}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <Label>Component</Label>
        <div className="mt-3 flex flex-wrap gap-2">
          {COMPONENTS.map((c) => {
            const active = state.component === c;
            return (
              <button
                key={c}
                onClick={() => update({ component: c })}
                className={`rounded-full border px-4 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                {c}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <Label>Units required</Label>
        <div className="mt-3 flex items-center justify-between rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
          <button
            aria-label="Decrease units"
            onClick={() => update({ units: Math.max(1, state.units - 1) })}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary"
          >
            <Minus className="h-4 w-4" />
          </button>
          <div className="text-center">
            <div className="font-serif-display text-4xl text-foreground">
              {state.units}
            </div>
            <div className="text-xs text-muted-foreground">unit{state.units > 1 ? "s" : ""}</div>
          </div>
          <button
            aria-label="Increase units"
            onClick={() => update({ units: Math.min(10, state.units + 1) })}
            className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground transition-colors hover:bg-secondary"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="mt-8">
        <Label>Urgency</Label>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {URGENCIES.map((u) => {
            const active = state.urgency === u.id;
            return (
              <button
                key={u.id}
                onClick={() => update({ urgency: u.id })}
                className={`flex items-center gap-3 rounded-2xl border p-4 text-left transition-all ${
                  active
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]"
                    : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${
                    active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}
                >
                  <u.icon className="h-5 w-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-foreground">{u.label}</span>
                  <span className="text-xs text-muted-foreground">{u.hint}</span>
                </span>
              </button>
            );
          })}
        </div>
      </section>
    </StepShell>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </div>
  );
}