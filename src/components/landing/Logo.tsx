import { Link } from "@tanstack/react-router";
import logoSrc from "@/assets/redstream-logo.png";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-center gap-2 ${className}`}>
      <img
        src={logoSrc}
        alt="Redstream Foundation logo"
        width={32}
        height={32}
        className="h-8 w-8 object-contain"
      />
      <span className="text-base font-semibold tracking-tight text-foreground">
        Redstream
      </span>
    </Link>
  );
}