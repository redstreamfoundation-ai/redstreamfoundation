import { createFileRoute, Link } from "@tanstack/react-router";
import logoSrc from "@/assets/redstream-logo.png";

export const Route = createFileRoute("/")({
  component: ComingSoon,
  head: () => ({
    meta: [
      { title: "Redstream Foundation — Coming Soon" },
      {
        name: "description",
        content:
          "Redstream Foundation is launching soon. A Delhi-based non-profit coordinating verified emergency blood donations across the NCR.",
      },
      { property: "og:title", content: "Redstream Foundation — Coming Soon" },
      {
        property: "og:description",
        content:
          "Redstream Foundation is launching soon. A Delhi-based non-profit coordinating verified emergency blood donations across the NCR.",
      },
      { property: "og:url", content: "https://redstreamfoundation.org/" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.org/" }],
  }),
});

function ComingSoon() {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[var(--gradient-soft)] px-6 page-fade">
      <div className="pointer-events-none absolute inset-0 -z-10 opacity-60">
        <div className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--gradient-emergency)] opacity-20 blur-3xl" />
      </div>

      <div className="mx-auto w-full max-w-xl text-center">
        <div className="flex justify-center">
          <img
            src={logoSrc}
            alt="Redstream Foundation logo"
            width={64}
            height={64}
            className="h-16 w-16 object-contain"
          />
        </div>

        <h1 className="font-serif-display mt-6 text-5xl font-normal tracking-tight text-foreground sm:text-6xl">
          Redstream Foundation
        </h1>

        <p className="mt-4 inline-flex items-center justify-center gap-2 rounded-full border border-border bg-background/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-pulse-ring rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
          </span>
          Coming Soon
        </p>

        <p className="mx-auto mt-6 max-w-md text-base leading-relaxed text-muted-foreground sm:text-lg">
          We're building a faster, more reliable way to connect patients in
          urgent need of blood with verified, nearby volunteer donors across
          Delhi NCR. Our website will be live shortly.
        </p>

        <p className="mt-10 text-xs text-muted-foreground/80">
          © {new Date().getFullYear()} Redstream Foundation
        </p>

        <Link
          to="/home"
          className="mt-6 inline-block text-xs text-muted-foreground/60 underline-offset-4 hover:text-muted-foreground hover:underline"
        >
          Preview site
        </Link>
      </div>
    </main>
  );
}
