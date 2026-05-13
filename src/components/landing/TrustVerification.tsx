import { ShieldCheck, Lock, HeartHandshake, FileCheck2, EyeOff, Stethoscope } from "lucide-react";

const ITEMS = [
  {
    icon: FileCheck2,
    title: "Proof-verified requests",
    body:
      "Every request must include a hospital requisition slip. Coordinators cross-check the stamp, doctor, and ward against partner hospital records before any donor is pinged.",
    micro: "Avg verification time · 4 minutes",
  },
  {
    icon: EyeOff,
    title: "Donor privacy by default",
    body:
      "Phone numbers, exact location, and identity are never shared. Calls and SMS route through a Redstream relay number. Donors can pause matching anytime, no questions asked.",
    micro: "Masked relay · zero data resale",
  },
  {
    icon: Stethoscope,
    title: "Secure medical document handling",
    body:
      "Requisition slips are encrypted at rest, accessible only to verified coordinators, and auto-deleted after 60 days. An audit hash is retained to prevent reuse.",
    micro: "Encrypted · auto-purged · audit-logged",
  },
  {
    icon: ShieldCheck,
    title: "Verified request process",
    body:
      "Three-step check: hospital validation, attendant identity confirmation, and clinical urgency review. Rejected requests are flagged and escalated to a senior coordinator.",
    micro: "3-step manual review · 24/7 staffing",
  },
  {
    icon: Lock,
    title: "You're always in control",
    body:
      "Set your radius, time slots, and emergency-only mode. Skip a request without explanation. Your reliability score isn't penalized for saying no.",
    micro: "No penalties · no quotas",
  },
  {
    icon: HeartHandshake,
    title: "NGO-led, volunteer-run",
    body:
      "Redstream Foundation is a registered Section-8 non-profit. We do not sell data. We do not charge patients. Operations are funded by grants and donors.",
    micro: "Section 8 · 80G eligible",
  },
];

export function TrustVerification() {
  return (
    <section id="trust" aria-label="Trust and verification" className="px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 max-w-2xl md:mb-14">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Built on trust
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Verified. Private. <span className="font-serif-display italic">Accountable.</span>
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground md:text-base">
            Trust isn't a tagline. It's the operational standard we hold every
            request, donor, and coordinator to.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 md:gap-6 lg:grid-cols-3">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="flex flex-col rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)] transition-all hover:-translate-y-0.5 hover:shadow-[var(--shadow-elevated)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                {it.body}
              </p>
              <div className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                {it.micro}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}