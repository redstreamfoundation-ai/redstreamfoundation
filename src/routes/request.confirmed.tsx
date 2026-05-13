import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, MapPin, Phone, MessageCircle, Navigation, Clock } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";
import { useRequest } from "@/lib/request-store";

export const Route = createFileRoute("/request/confirmed")({
  component: Confirmed,
});

function Confirmed() {
  const { state } = useRequest();
  return (
    <StepShell
      eyebrow="Donor confirmed"
      title="A donor is on the way."
      subtitle="We've shared the hospital details with them. You'll get an update as they get closer."
      showBack={false}
      footer={
        <Link
          to="/request/completed"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
        >
          Mark donation completed
        </Link>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-[var(--gradient-emergency)] text-lg font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
            R
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-semibold text-foreground">Donor R.</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                <Check className="h-3 w-3" /> Confirmed
              </span>
            </div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Saket · 1.4 km away
            </div>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Stat icon={Clock} label="Estimated arrival" value="~ 18 min" />
          <Stat icon={Navigation} label="Status" value="En route" />
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2">
          <a
            href="tel:+911140000000"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            <Phone className="h-4 w-4" /> Call via relay
          </a>
          <button className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground">
            <MessageCircle className="h-4 w-4" /> Message
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Coordination
        </div>
        <ul className="mt-4 space-y-4">
          {[
            { label: "Share hospital entrance & ward number with the donor.", t: "Now" },
            { label: "Inform the blood bank that a donor is arriving.", t: "Now" },
            { label: "A coordinator will check in once donor reaches.", t: "~ 18 min" },
          ].map((s, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-primary/10 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="text-sm text-foreground">{s.label}</div>
                <div className="text-xs text-muted-foreground">{s.t}</div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
        Heading to <span className="font-medium text-foreground">{state.hospital || "the hospital"}</span>
        {state.locality ? `, ${state.locality}` : ""}. The donor sees only the hospital
        address — your personal contact remains masked.
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
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        {label}
      </div>
      <div className="mt-1 font-serif-display text-2xl text-foreground">{value}</div>
    </div>
  );
}