import { Phone, Mail, MapPin, ShieldCheck, MapPinned, Users, LifeBuoy, Send } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Logo } from "./Logo";
import { supabase } from "@/integrations/supabase/client";

export function Footer() {
  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      className="border-t border-border bg-secondary/40 px-5 py-14"
    >
      <div className="mx-auto max-w-6xl">
        {/* Trust strip */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <TrustChip icon={MapPinned} label="Delhi Pilot Initiative" sub="10 NCR zones live" />
          <TrustChip icon={ShieldCheck} label="Data Protection" sub="Encrypted · audit-logged" />
          <TrustChip icon={Users} label="Volunteer Coordination" sub="Verified donor network" />
          <TrustChip icon={LifeBuoy} label="Emergency Support" sub="24/7 coordinator desk" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12 md:gap-x-8 lg:gap-x-12">
          <div className="md:col-span-12 lg:col-span-4">
            <Logo />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Redstream Foundation is a Delhi-based non-profit coordinating verified
              emergency blood donations across the NCR.
            </p>
            <div className="mt-5 space-y-1 text-xs text-muted-foreground">
              <div>
                <span className="font-medium text-foreground">NGO registration:</span>{" "}
                Section 8 · CIN pending verification
              </div>
              <div>
                <span className="font-medium text-foreground">Registered office:</span>{" "}
                New Delhi, India
              </div>
            </div>
          </div>

          <nav
            aria-label="Footer navigation"
            className="grid grid-cols-1 gap-x-6 gap-y-8 text-sm sm:grid-cols-2 md:col-span-12 md:grid-cols-4 lg:col-span-8"
          >
            <FooterCol title="Platform">
              <li><Link to="/request" className="hover:text-primary">Request blood</Link></li>
              <li><Link to="/donor" className="hover:text-primary">Become a donor</Link></li>
              <li><a href="#how" className="hover:text-primary">How it works</a></li>
              <li><a href="#pilot" className="hover:text-primary">Delhi pilot</a></li>
            </FooterCol>
            <FooterCol title="Foundation">
              <li><a href="#mission" className="hover:text-primary">Our mission</a></li>
              <li><a href="#trust" className="hover:text-primary">Trust & safety</a></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy policy</Link></li>
              <li><a href="#" className="hover:text-primary">Terms of use</a></li>
            </FooterCol>
            <ContactCol />
            <HelplineCol />
          </nav>
        </div>

        <ContactForm />

        <div className="mt-12 rounded-2xl border border-border bg-background/60 p-4 text-xs leading-relaxed text-muted-foreground">
          Redstream Foundation coordinates emergency donor connections through
          licensed hospitals and blood banks. We do not store, sell, or transfuse
          blood ourselves. All clinical procedures are performed by partner
          medical institutions.
        </div>

        <div className="mt-6 flex flex-col gap-2 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>© {new Date().getFullYear()} Redstream Foundation. A registered Indian non-profit.</div>
          <div>Delhi NCR · India</div>
        </div>
      </div>
    </footer>
  );
}

function TrustChip({
  icon: Icon,
  label,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-background p-3">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <div className="text-[13px] font-semibold leading-tight text-foreground">{label}</div>
        <div className="text-[11px] leading-tight text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 break-words text-foreground">{children}</ul>
    </div>
  );
}

function ContactCol() {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Contact
      </h3>
      <dl className="mt-3 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2 gap-y-3 text-sm text-foreground">
        <dt className="sr-only">Email</dt>
        <dd className="contents">
          <Mail className="mt-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <a
            href="mailto:contact@redstreamfoundation.org"
            aria-label="Email Redstream Foundation"
            className="-my-1 block break-all py-1 hover:text-primary"
          >
            contact@redstreamfoundation.org
          </a>
        </dd>
        <dt className="sr-only">Coordinator hours</dt>
        <dd className="contents">
          <span className="mt-1 inline-block h-1.5 w-1.5 self-start rounded-full bg-emerald-500" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Coordinator desk · 24/7</span>
        </dd>
        <dt className="sr-only">Partnerships</dt>
        <dd className="contents">
          <span className="mt-1 inline-block h-1.5 w-1.5 self-start rounded-full bg-muted-foreground/50" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">Media &amp; partnerships on request</span>
        </dd>
      </dl>
    </div>
  );
}

function HelplineCol() {
  return (
    <div className="min-w-0">
      <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        Emergency helpline
      </h3>
      <dl className="mt-3 grid grid-cols-[1.25rem_minmax(0,1fr)] gap-x-2 gap-y-3">
        <dt className="sr-only">Phone</dt>
        <dd className="contents">
          <Phone className="mt-2.5 h-4 w-4 text-primary" aria-hidden="true" />
          <span
            aria-label="Helpline launching June 2026"
            className="-my-1 inline-flex min-h-11 items-center py-1 text-sm font-semibold text-primary"
          >
            Helpline launching June 2026
          </span>
        </dd>
        <dt className="sr-only">Coverage</dt>
        <dd className="contents">
          <MapPin className="mt-1 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <span className="text-xs text-muted-foreground">24/7 coverage across Delhi NCR at launch</span>
        </dd>
      </dl>
    </div>
  );
}

function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const valid =
    name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    message.trim().length > 0;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);
    setError(null);
    const { error: insertError } = await supabase.from("contact_messages").insert({
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
    });
    setSubmitting(false);
    if (insertError) {
      setError("Couldn't send your message. Please try again or email us directly.");
      return;
    }
    const subject = encodeURIComponent(`Website contact — ${name.slice(0, 80)}`);
    const body = encodeURIComponent(
      `${message.slice(0, 1000)}\n\n— ${name.slice(0, 80)} <${email.slice(0, 120)}>`,
    );
    window.location.href = `mailto:contact@redstreamfoundation.org?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <section
      aria-label="Contact us"
      className="mt-12 rounded-3xl border border-border bg-background/60 p-6 md:p-8"
    >
      <div className="grid gap-8 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-5">
          <h3 className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Contact us
          </h3>
          <p className="font-serif-display mt-3 text-2xl leading-tight text-foreground md:text-3xl">
            Partnerships, press, or general questions.
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            For real emergencies, please call our 24/7 helpline above — it's the
            fastest way to reach a coordinator.
          </p>
        </div>

        <form onSubmit={onSubmit} className="md:col-span-7">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Name
              </span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 80))}
                required
                maxLength={80}
                placeholder="Your name"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Email
              </span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 120))}
                required
                maxLength={120}
                placeholder="you@example.com"
                className="mt-2 w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </label>
          </div>
          <label className="mt-3 block">
            <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Message
            </span>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value.slice(0, 1000))}
              required
              maxLength={1000}
              rows={4}
              placeholder="How can we help?"
              className="mt-2 w-full resize-y rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <div className="mt-1 text-right text-[11px] text-muted-foreground">
              {message.length} / 1000
            </div>
          </label>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted-foreground">
              Opens your email app addressed to{" "}
              <span className="font-medium text-foreground">contact@redstreamfoundation.org</span>.
            </p>
            <button
              type="submit"
              disabled={!valid || submitting}
              className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending…" : sent ? "Message sent" : "Send message"}
            </button>
          </div>
          {error ? (
            <p className="mt-2 text-right text-xs text-primary">{error}</p>
          ) : null}
        </form>
      </div>
    </section>
  );
}