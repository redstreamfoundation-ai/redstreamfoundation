import { createFileRoute, Link } from "@tanstack/react-router";
import { Heart, Share2, Home, HandHeart, Repeat, Sparkles, UserPlus, ArrowRight, Check } from "lucide-react";
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

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Coordination summary
        </div>
        <ul className="mt-3 space-y-2.5">
          {[
            "Request verified by coordinator",
            "Donor matched and confirmed",
            "Donation completed at hospital",
            "Request closed and archived",
          ].map((s) => (
            <li key={s} className="flex items-center gap-3 text-sm text-foreground">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald-500/10 text-emerald-600">
                <Check className="h-3.5 w-3.5" />
              </span>
              {s}
            </li>
          ))}
        </ul>
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

      {/* Support Redstream */}
      <section className="mt-8 overflow-hidden rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="inline-flex items-center gap-2 rounded-full bg-background/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
          <HandHeart className="h-3.5 w-3.5" /> Support Redstream
        </div>
        <h2 className="mt-3 text-xl font-semibold leading-tight tracking-tight text-foreground md:text-2xl">
          Help us coordinate more emergencies across Delhi.
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Redstream Foundation is a non-profit relying on volunteers and community
          support to keep emergency donor coordination free for every family. Your
          contribution funds 24×7 coordinators, verification, and donor outreach.
        </p>

        <div className="mt-5 space-y-2.5">
          <SupportOption
            icon={Sparkles}
            title="One-time contribution"
            body="Fund a single emergency coordination — covers verification, outreach and helpline costs."
            cta="Contribute once"
          />
          <SupportOption
            icon={HandHeart}
            title="Sponsor an emergency case"
            body="Underwrite urgent donor outreach for a critical request in your city."
            cta="Sponsor a case"
          />
          <SupportOption
            icon={Repeat}
            title="Become a monthly supporter"
            body="Sustain Delhi's emergency response network with a recurring contribution."
            cta="Support monthly"
            highlight
          />
        </div>

        <p className="mt-4 text-[11px] leading-relaxed text-muted-foreground">
          80G receipts available · Donations are processed securely · You can pause or stop anytime.
        </p>
      </section>

      {/* Other ways to help */}
      <section className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-sm font-semibold text-foreground">Other ways to help</div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          Even sharing Redstream with one person expands the donor network for the next emergency.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <Link
            to="/donor"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary/10 px-4 py-2.5 text-sm font-medium text-primary transition-colors hover:bg-primary/15"
          >
            <UserPlus className="h-4 w-4" /> Become a donor
          </Link>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary">
            <Share2 className="h-4 w-4" /> Share Redstream
          </button>
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Heart className="h-4 w-4 text-primary" /> Support the mission
          </Link>
        </div>
      </section>
    </StepShell>
  );
}

function SupportOption({
  icon: Icon,
  title,
  body,
  cta,
  highlight,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
  cta: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border p-4 transition-colors ${
        highlight
          ? "border-primary/40 bg-background/80"
          : "border-border bg-background/70"
      }`}
    >
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-foreground">{title}</span>
          {highlight ? (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Popular
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{body}</p>
      </div>
      <button
        className={`inline-flex shrink-0 items-center gap-1 self-center rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          highlight
            ? "bg-primary text-primary-foreground hover:bg-[var(--primary-deep)]"
            : "border border-border bg-background text-foreground hover:bg-secondary"
        }`}
      >
        {cta} <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}