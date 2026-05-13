import { Logo } from "./Logo";
import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <Logo />
        <nav className="hidden items-center gap-7 text-sm text-muted-foreground md:flex">
          <a href="#how" className="transition-colors hover:text-foreground">How it works</a>
          <a href="#why" className="transition-colors hover:text-foreground">Why Redstream</a>
          <a href="#trust" className="transition-colors hover:text-foreground">Trust</a>
        </nav>
        <Link
          to="/request"
          className="inline-flex items-center rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-transform hover:scale-[1.02]"
        >
          Request blood
        </Link>
      </div>
    </header>
  );
}