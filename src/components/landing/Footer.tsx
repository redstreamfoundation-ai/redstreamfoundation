import { Phone, Mail, ShieldCheck, MapPinned, Users, LifeBuoy } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 px-5 py-14">
      <div className="mx-auto max-w-6xl">
        {/* Trust strip */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <TrustChip icon={MapPinned} label="Delhi Pilot Initiative" sub="10 NCR zones live" />
          <TrustChip icon={ShieldCheck} label="Data Protection" sub="Encrypted · audit-logged" />
          <TrustChip icon={Users} label="Volunteer Coordination" sub="Verified donor network" />
          <TrustChip icon={LifeBuoy} label="Emergency Support" sub="24/7 coordinator desk" />
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-4">
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

          <div className="grid grid-cols-2 gap-6 text-sm md:col-span-8 md:grid-cols-4">
            <FooterCol title="Platform">
              <li><Link to="/request" className="hover:text-primary">Request blood</Link></li>
              <li><Link to="/donor" className="hover:text-primary">Become a donor</Link></li>
              <li><a href="#how" className="hover:text-primary">How it works</a></li>
              <li><a href="#pilot" className="hover:text-primary">Delhi pilot</a></li>
            </FooterCol>
            <FooterCol title="Foundation">
              <li><a href="#mission" className="hover:text-primary">Our mission</a></li>
              <li><a href="#trust" className="hover:text-primary">Trust & safety</a></li>
              <li><a href="#" className="hover:text-primary">Privacy policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms of use</a></li>
            </FooterCol>
            <FooterCol title="Contact">
              <li>
                <a
                  href="mailto:contact@redstreamfoundation.org"
                  className="flex items-start gap-1.5 break-all hover:text-primary"
                >
                  <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                  <span className="break-all">contact@redstreamfoundation.org</span>
                </a>
              </li>
              <li className="text-muted-foreground">Coordinator desk · 24/7</li>
              <li className="text-muted-foreground">Media & partnerships on request</li>
            </FooterCol>
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Emergency helpline
              </div>
              <a
                href="tel:+911140000000"
                className="mt-3 inline-flex items-center gap-2 text-base font-semibold text-primary"
              >
                <Phone className="h-4 w-4" />
                +91 11 4000 0000
              </a>
              <p className="mt-2 text-xs text-muted-foreground">
                Available 24/7 across Delhi NCR
              </p>
            </div>
          </div>
        </div>

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
    <div>
      <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {title}
      </div>
      <ul className="mt-3 space-y-2 text-foreground">{children}</ul>
    </div>
  );
}