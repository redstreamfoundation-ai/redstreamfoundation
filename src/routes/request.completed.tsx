import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Share2, Home } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";

export const Route = createFileRoute("/request/completed")({
  component: Completed,
});

function Completed() {
  return (
    <StepShell
      eyebrow="Request completed"
      title="A life supported, together."
      subtitle="Thank you for trusting Redstream during a difficult moment. The donation is complete and the request is now closed."
      showBack={false}
      footer={
        <Link
          to="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Home className="h-4 w-4" /> Back to home
        </Link>
      }
    >
      <div className="grid place-items-center py-4">
        <div className="relative h-32 w-32">
          <span className="absolute inset-0 rounded-full bg-primary/10 animate-pulse-ring" />
          <div className="relative grid h-32 w-32 place-items-center rounded-full bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <Heart className="h-12 w-12 fill-current" />
          </div>
        </div>
      </div>

      <blockquote className="mt-6 rounded-3xl border border-border bg-secondary/60 p-6 text-center">
        <p className="font-serif-display text-xl italic leading-snug text-foreground">
          "Every drop matters. Every minute matters. Every donor — and every family
          who asked — matters."
        </p>
        <footer className="mt-3 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Redstream Foundation
        </footer>
      </blockquote>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { v: "1", l: "Donor matched" },
          { v: "12 min", l: "To confirmation" },
          { v: "1", l: "Life supported" },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-2xl border border-border bg-card p-4 text-center shadow-[var(--shadow-soft)]"
          >
            <div className="font-serif-display text-2xl text-foreground">{s.v}</div>
            <div className="mt-1 text-[11px] text-muted-foreground">{s.l}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-sm font-semibold text-foreground">Pay it forward</div>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          Help another family in Delhi by sharing Redstream, or join the donor
          network yourself.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <Share2 className="h-4 w-4" /> Share
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary"
          >
            Become a donor
          </Link>
        </div>
      </div>
    </StepShell>
  );
}