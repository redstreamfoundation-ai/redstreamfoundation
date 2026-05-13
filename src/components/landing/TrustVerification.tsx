import { ShieldCheck, Lock, HeartHandshake } from "lucide-react";

const ITEMS = [
  {
    icon: ShieldCheck,
    title: "Verified requests",
    body: "Every patient request is validated against hospital records before donors are contacted.",
  },
  {
    icon: Lock,
    title: "Donor privacy",
    body: "Phone numbers are masked. Donors choose what they share, and can opt out anytime.",
  },
  {
    icon: HeartHandshake,
    title: "NGO-led, volunteer-run",
    body: "Redstream Foundation is a registered non-profit. We do not sell data. We do not charge patients.",
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
        </div>
        <div className="grid gap-4 md:grid-cols-3 md:gap-6">
          {ITEMS.map((it) => (
            <div
              key={it.title}
              className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]"
            >
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-base font-semibold text-foreground">{it.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{it.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}