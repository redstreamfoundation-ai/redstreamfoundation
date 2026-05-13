import { Link, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Phone } from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import type { ReactNode } from "react";

type Props = {
  step?: number;
  total?: number;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  showBack?: boolean;
};

export function StepShell({
  step,
  total = 3,
  eyebrow,
  title,
  subtitle,
  children,
  footer,
  showBack = true,
}: Props) {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          {showBack ? (
            <button
              onClick={() => router.history.back()}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Go back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          ) : (
            <Logo />
          )}
          <a
            href="tel:+911140000000"
            className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground"
          >
            <Phone className="h-3.5 w-3.5 text-primary" />
            Helpline
          </a>
        </div>
        {step ? (
          <div className="mx-auto max-w-2xl px-5 pb-3">
            <div className="flex items-center gap-2">
              {Array.from({ length: total }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < step ? "bg-primary" : "bg-secondary"
                  }`}
                />
              ))}
            </div>
            <div className="mt-2 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Step {step} of {total}
            </div>
          </div>
        ) : null}
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-32 pt-8">
        {eyebrow ? (
          <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </span>
        ) : null}
        <h1 className="mt-2 text-2xl font-semibold leading-tight tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">
            {subtitle}
          </p>
        ) : null}
        <div className="mt-8">{children}</div>
      </main>

      {footer ? (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
          <div className="mx-auto max-w-2xl px-5 py-4">{footer}</div>
        </div>
      ) : null}
    </div>
  );
}

export function PrimaryButton({
  children,
  disabled,
  onClick,
  type = "button",
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
    >
      {children}
    </button>
  );
}

export function SecondaryLink({
  to,
  children,
}: {
  to: string;
  children: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-border bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
    >
      {children}
    </Link>
  );
}