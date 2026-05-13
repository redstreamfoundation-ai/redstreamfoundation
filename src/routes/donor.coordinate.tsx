import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2, MapPin, Phone, MessageCircle, Navigation, Clock, Check } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";

export const Route = createFileRoute("/donor/coordinate")({
  component: Coordinate,
  head: () => ({
    meta: [
      { title: "Coordinate your donation — Redstream Foundation" },
      {
        name: "description",
        content:
          "Hospital details, contact, estimated timing, and step-by-step instructions for your accepted Redstream emergency blood donation.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

const STEPS = [
  { label: "Carry a photo ID and stay hydrated.", t: "Before you leave" },
  { label: "Reach the hospital blood bank reception.", t: "On arrival" },
  { label: "Mention 'Redstream donor for Patient #4821'.", t: "At the desk" },
  { label: "Donation typically takes 20–30 minutes.", t: "During" },
];

function Coordinate() {
  return (
    <StepShell
      eyebrow="Coordination"
      title="Thank you for accepting."
      subtitle="Here's everything you need. The hospital and patient have been notified."
      footer={
        <Link
          to="/donor/thanks"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)]"
        >
          <Check className="h-4 w-4" /> I've completed the donation
        </Link>
      }
    >
      <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]">
        <div className="flex items-center gap-3 border-b border-border p-5">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/10 text-primary">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold text-foreground">Sir Ganga Ram Hospital</div>
            <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" /> Rajinder Nagar · Gate 2, Blood Bank
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 divide-x divide-border">
          <Stat icon={Navigation} label="Distance" value="2.4 km" />
          <Stat icon={Clock} label="Drive" value="~ 12 min" />
          <Stat icon={Clock} label="Window" value="60 min" />
        </div>
        <div className="grid grid-cols-2 gap-2 border-t border-border p-4">
          <a
            href="https://maps.google.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-4 py-3 text-sm font-medium text-primary-foreground"
          >
            <Navigation className="h-4 w-4" /> Open directions
          </a>
          <a
            href="tel:+911140000000"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background px-4 py-3 text-sm font-medium text-foreground"
          >
            <Phone className="h-4 w-4" /> Call hospital
          </a>
        </div>
      </div>

      {/* Patient contact */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Attendant contact
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">Ankit (brother)</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              Contact via masked relay · your number stays private
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <a
              href="tel:+911140000000"
              aria-label="Call attendant"
              className="grid h-10 w-10 place-items-center rounded-full bg-primary text-primary-foreground"
            >
              <Phone className="h-4 w-4" />
            </a>
            <button
              aria-label="Message attendant"
              className="grid h-10 w-10 place-items-center rounded-full border border-border bg-background text-foreground"
            >
              <MessageCircle className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-5 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Coordination checklist
        </div>
        <ul className="mt-4 space-y-4">
          {STEPS.map((s, i) => (
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

      <div className="mt-5 rounded-2xl border border-border bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
        Hospital and attendant have been notified. A coordinator will check in with
        you in 30 minutes — no action needed.
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
    <div className="px-4 py-4 text-center">
      <div className="flex items-center justify-center gap-1.5 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        <Icon className="h-3 w-3 text-primary" /> {label}
      </div>
      <div className="mt-1 text-sm font-semibold text-foreground">{value}</div>
    </div>
  );
}