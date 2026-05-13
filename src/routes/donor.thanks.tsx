import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Calendar, Clock, Share2, Home } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";

export const Route = createFileRoute("/donor/thanks")({
  component: Thanks,
});

function Thanks() {
  const today = new Date();
  const eligibleDate = new Date(today);
  eligibleDate.setDate(eligibleDate.getDate() + 90);
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  return (
    <StepShell
      eyebrow="Donation logged"
      title="You did something quietly extraordinary."
      subtitle="On behalf of the patient and their family — thank you. Take care of yourself today."
      showBack={false}
      footer={
        <Link
          to="/donor/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Home className="h-4 w-4" /> Back to dashboard
        </Link>
      }
    >
      <div className="grid place-items-center py-4">
        <div className="relative h-32 w-32">
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-ring" />
          <span className="absolute inset-3 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:300ms]" />
          <div className="relative grid h-32 w-32 place-items-center rounded-full bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Heart className="h-12 w-12 fill-current" />
          </div>
        </div>
      </div>

      <blockquote className="mt-6 rounded-3xl border border-border bg-secondary/60 p-6 text-center">
        <p className="font-serif-display text-xl italic leading-snug text-foreground">
          "What you've given today doesn't ask to be remembered. But it will be."
        </p>
        <footer className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Redstream Foundation
        </footer>
      </blockquote>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Stat icon={Calendar} label="Donation logged" value={fmt(today)} />
        <Stat icon={Clock} label="Cooldown ends" value={fmt(eligibleDate)} />
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-sm font-semibold text-foreground">Take care of yourself</div>
        <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
          <li>• Drink plenty of water for the next 24 hours.</li>
          <li>• Avoid heavy exercise today.</li>
          <li>• Eat iron-rich foods over the next few days.</li>
        </ul>
      </div>

      <div className="mt-6 rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
              Next eligibility
            </div>
            <div className="mt-1 font-serif-display text-2xl text-foreground">
              {fmt(eligibleDate)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              We'll quietly pause requests until then.
            </div>
          </div>
          <button
            className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-foreground"
          >
            <Share2 className="h-3.5 w-3.5" /> Share
          </button>
        </div>
      </div>
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
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}