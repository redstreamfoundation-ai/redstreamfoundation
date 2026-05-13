import { AlertTriangle, Sparkles } from "lucide-react";

export function WhyRedstream() {
  return (
    <section id="why" aria-label="Why Redstream" className="px-5 py-16 md:py-24">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-2 md:gap-16">
        <div>
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Why we exist
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Delhi loses lives to <span className="font-serif-display italic text-primary">delays</span>, not shortages.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground">
            Most emergency blood needs in Delhi are met not by blood banks, but by family
            members frantically calling strangers on WhatsApp. Information is scattered,
            donors are unverified, and minutes turn into hours.
          </p>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            Redstream replaces that chaos with a calm, verified, intelligent matching
            layer — built by an NGO, run by volunteers, accountable to patients.
          </p>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">The problem</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Forwarded messages, unverified contacts, no follow-up. Families lose hours
              searching for the right donor at the worst possible time.
            </p>
          </div>

          <div className="rounded-2xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-soft)]">
            <div className="flex items-center gap-3">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Intelligent matching</h3>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We rank donors by blood compatibility, distance to hospital, recent donation
              eligibility, and live availability — so the right person is asked first.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}