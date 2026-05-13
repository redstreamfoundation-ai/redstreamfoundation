import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, MapPin, Lock, ArrowRight, Phone, HeartPulse } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";

export const Route = createFileRoute("/request/")({
  component: EmergencyIntro,
});

const TRUST = [
  {
    icon: ShieldCheck,
    title: "Verified request process",
    body: "Every request is reviewed by a coordinator before donor activation.",
  },
  {
    icon: MapPin,
    title: "Nearby donor matching",
    body: "Donors are matched by blood group, locality, and current availability.",
  },
  {
    icon: Lock,
    title: "Privacy protected",
    body: "Patient details and your contact stay masked behind our relay.",
  },
];

function EmergencyIntro() {
  return (
    <StepShell
      eyebrow="Emergency coordination"
      title="Emergency Blood Request Coordination"
      subtitle="Our coordination team verifies emergency requests and begins matching nearby volunteer donors immediately. The next 4 steps take about 2 minutes."
      showBack={false}
      footer={
        <div className="space-y-3">
          <Link
            to="/request/blood"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)]"
          >
            <HeartPulse className="h-4 w-4" />
            Continue emergency request
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="tel:+911140000000"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <Phone className="h-4 w-4 text-primary" /> Or call coordinator helpline
          </a>
        </div>
      }
    >
      <div className="space-y-3">
        {TRUST.map((t) => (
          <div
            key={t.title}
            className="flex items-start gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]"
          >
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
              <t.icon className="h-5 w-5" />
            </span>
            <div>
              <div className="text-sm font-semibold text-foreground">{t.title}</div>
              <div className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t.body}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-primary/20 bg-[var(--gradient-soft)] p-5">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
          What happens next
        </div>
        <ol className="mt-3 space-y-2 text-sm text-foreground">
          {[
            "Tell us the blood requirement",
            "Share hospital + attendant details",
            "Upload a hospital document as proof",
            "Review & submit — we begin matching donors immediately",
          ].map((step, i) => (
            <li key={step} className="flex items-start gap-3">
              <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-[11px] font-semibold text-primary">
                {i + 1}
              </span>
              <span className="leading-snug">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </StepShell>
  );
}
