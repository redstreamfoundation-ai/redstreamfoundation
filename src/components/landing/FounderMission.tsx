import { HeartPulse } from "lucide-react";

export function FounderMission() {
  return (
    <section
      id="mission"
      aria-label="Why Redstream Foundation exists"
      className="bg-secondary/30 px-5 py-16 md:py-24"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Our mission
          </span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-4xl">
            Why Redstream Foundation <span className="font-serif-display italic">exists</span>
          </h2>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground">
            <HeartPulse className="h-3.5 w-3.5 text-primary" />
            A volunteer-led humanitarian initiative
          </div>
        </div>

        <div className="space-y-5 text-[15px] leading-relaxed text-muted-foreground md:col-span-7 md:text-base">
          <p>
            Across Delhi, hospitals routinely struggle to arrange the right donor in
            the narrow window an emergency allows. Families are left calling
            strangers, forwarding messages, and chasing leads while a patient waits
            in a ward.
          </p>
          <p>
            Donor coordination today is fragmented — split across WhatsApp groups,
            informal networks, and unverified contacts. There is no shared workflow,
            no accountability, and no way to know if help is actually on the way.
          </p>
          <p className="text-foreground">
            Redstream Foundation was created to bring calm, verified coordination
            to those moments — connecting hospitals, attendants, and willing donors
            through a single trusted response layer, starting with Delhi NCR.
          </p>
          <div className="border-l-2 border-primary/40 pl-4 text-sm text-muted-foreground">
            We are not a replacement for blood banks. We are the coordination layer
            that helps the right donor reach the right hospital, on time.
          </div>
        </div>
      </div>
    </section>
  );
}