import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <span className="relative grid h-8 w-8 place-items-center rounded-xl bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow)]">
        <svg viewBox="0 0 24 24" className="h-4 w-4 text-primary-foreground" fill="currentColor" aria-hidden>
          <path d="M12 2.5c2.8 3.6 6.5 7.6 6.5 11.5a6.5 6.5 0 1 1-13 0C5.5 10.1 9.2 6.1 12 2.5z" />
        </svg>
      </span>
      <span className="text-base font-semibold tracking-tight text-foreground">
        Redstream
      </span>
    </Link>
  );
}