import { createFileRoute, Link } from "@tanstack/react-router";
import { Nav } from "@/components/landing/Nav";
import { Footer } from "@/components/landing/Footer";

export const Route = createFileRoute("/privacy")({
  component: PrivacyPage,
  head: () => ({
    meta: [
      { title: "Privacy Policy — Redstream Foundation" },
      {
        name: "description",
        content:
          "How Redstream Foundation collects, uses, and protects personal information of donors, patients, and helpline users across Delhi NCR.",
      },
      { property: "og:title", content: "Privacy Policy — Redstream Foundation" },
      {
        property: "og:description",
        content:
          "Read how Redstream Foundation handles donor and patient data — what we collect, why, and your rights.",
      },
      { property: "og:url", content: "https://redstreamfoundation.org/privacy" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.org/privacy" }],
  }),
});

function PrivacyPage() {
  const updated = "May 14, 2026";
  return (
    <div className="min-h-screen bg-background text-foreground page-fade">
      <Nav />
      <main className="px-5 py-16 md:py-24">
        <article className="mx-auto max-w-3xl">
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Legal
          </span>
          <h1 className="font-serif-display mt-3 text-4xl font-normal tracking-tight text-foreground md:text-5xl">
            Privacy Policy
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">Last updated: {updated}</p>

          <div className="prose prose-neutral mt-10 max-w-none space-y-8 text-[15px] leading-relaxed text-foreground">
            <Section title="1. Who we are">
              Redstream Foundation is a Delhi-based non-profit (Section 8 company) that
              coordinates verified emergency blood donations across the NCR by matching
              patients with nearby volunteer donors.
            </Section>

            <Section title="2. Information we collect">
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  <span className="font-medium text-foreground">Donor data:</span> name,
                  phone number, blood group, locality, PIN code, and last donation date.
                </li>
                <li>
                  <span className="font-medium text-foreground">Patient request data:</span>{" "}
                  patient name, blood group, hospital and locality, urgency, and contact
                  details for the requester.
                </li>
                <li>
                  <span className="font-medium text-foreground">Helpline records:</span>{" "}
                  call notes captured by our coordinators for follow-up.
                </li>
              </ul>
            </Section>

            <Section title="3. How we use it">
              We use this information solely to (a) match patients with eligible donors,
              (b) coordinate the donation with hospitals and blood banks, and (c) keep an
              audit trail for safety. We do not sell or rent personal data.
            </Section>

            <Section title="4. Sharing">
              Donor contact details are shared with the patient's coordinator only after
              the donor accepts a request. Aggregated, non-identifying statistics may be
              published in our impact reports.
            </Section>

            <Section title="5. Data security">
              All records are encrypted in transit and at rest. Access is restricted to
              authorised coordinators on a need-to-know basis and is audit-logged.
            </Section>

            <Section title="6. Your rights">
              You can request access, correction, or deletion of your personal data at any
              time by writing to{" "}
              <a className="text-primary hover:underline" href="mailto:privacy@redstreamfoundation.org">
                privacy@redstreamfoundation.org
              </a>
              . Donors can also withdraw from the network from their dashboard.
            </Section>

            <Section title="7. Retention">
              Donor profiles are retained for as long as you remain in the network.
              Patient request records are retained for two years for safety review,
              after which identifying fields are removed.
            </Section>

            <Section title="8. Contact">
              Questions about this policy? Email{" "}
              <a className="text-primary hover:underline" href="mailto:contact@redstreamfoundation.org">
                contact@redstreamfoundation.org
              </a>
              .
            </Section>
          </div>

          <div className="mt-12">
            <Link
              to="/home"
              className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
            >
              ← Back to site
            </Link>
          </div>
        </article>
      </main>
      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>
      <div className="mt-3 text-muted-foreground">{children}</div>
    </section>
  );
}
