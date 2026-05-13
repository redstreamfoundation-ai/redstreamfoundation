import { Phone } from "lucide-react";

export function EmergencyCTA() {
  return (
    <section aria-label="Emergency helpline" className="px-5 pb-16 md:pb-24">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-hidden rounded-3xl bg-[var(--gradient-emergency)] p-8 text-primary-foreground shadow-[var(--shadow-elevated)] md:p-12">
          <div className="flex flex-col items-start gap-6 md:flex-row md:items-center md:justify-between">
            <div className="max-w-xl">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-primary-foreground/80">
                24 / 7 helpline
              </span>
              <h2 className="mt-3 text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
                In an emergency right now? <span className="font-serif-display italic">Call us.</span>
              </h2>
              <p className="mt-3 text-sm text-primary-foreground/85 md:text-base">
                Our coordinators will verify your request and start matching donors immediately.
              </p>
            </div>
            <a
              href="tel:+911140000000"
              className="inline-flex w-full items-center justify-center gap-3 rounded-full bg-background px-6 py-4 text-base font-semibold text-primary shadow-[var(--shadow-soft)] transition-transform hover:scale-[1.02] md:w-auto"
            >
              <Phone className="h-4 w-4" />
              +91 11 4000 0000
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}