import { Phone } from "lucide-react";
import { Logo } from "./Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-secondary/40 px-5 py-12">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Redstream Foundation is a Delhi-based non-profit coordinating verified
            emergency blood donations across the NCR.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-6 text-sm md:col-span-2 md:grid-cols-3">
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Platform
            </div>
            <ul className="mt-3 space-y-2 text-foreground">
              <li><a href="#request" className="hover:text-primary">Request blood</a></li>
              <li><a href="#donor" className="hover:text-primary">Become a donor</a></li>
              <li><a href="#how" className="hover:text-primary">How it works</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              Foundation
            </div>
            <ul className="mt-3 space-y-2 text-foreground">
              <li><a href="#" className="hover:text-primary">Privacy policy</a></li>
              <li><a href="#" className="hover:text-primary">Terms</a></li>
              <li><a href="#" className="hover:text-primary">Contact</a></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
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
            <p className="mt-2 text-xs text-muted-foreground">Available 24 / 7 across Delhi NCR</p>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 max-w-6xl border-t border-border pt-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Redstream Foundation. A registered Indian non-profit.
      </div>
    </footer>
  );
}