import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Heart,
  ShieldCheck,
  Clock,
  Sparkles,
  Calendar,
  Phone,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";

export const Route = createFileRoute("/donor/")({
  component: DonorLanding,
  head: () => ({
    meta: [
      { title: "Become an emergency blood donor in Delhi — Redstream" },
      {
        name: "description",
        content:
          "Join Redstream's verified volunteer donor network in Delhi NCR. Set your availability, get matched only when nearby, and help save lives in emergencies.",
      },
      { property: "og:title", content: "Become an emergency blood donor in Delhi — Redstream" },
      {
        property: "og:description",
        content:
          "Volunteer for verified emergency blood requests near you, on your schedule, with full privacy.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/donor" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/donor.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/donor.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/donor" }],
  }),
});

function DonorLanding() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <Logo />
          <Link
            to="/donor/dashboard"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Already a donor? Sign in
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-5 pb-32 pt-10">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium text-primary">
          <Heart className="h-3 w-3 fill-current" /> Donor network · Delhi NCR
        </span>

        <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-tight text-foreground md:text-4xl">
          Be the reason someone's{" "}
          <span className="font-serif-display italic text-primary">tomorrow</span>{" "}
          arrives.
        </h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          Redstream is a volunteer-run network of verified blood donors across Delhi.
          You stay in control — choose when, how often, and how far you're willing to help.
        </p>

        <div className="mt-8 grid gap-3 md:grid-cols-3">
          {[
            { v: "8,400+", l: "Verified donors" },
            { v: "11 min", l: "Avg response" },
            { v: "42", l: "Delhi zones" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border bg-card p-4 text-center shadow-[var(--shadow-soft)]"
            >
              <div className="font-serif-display text-2xl text-foreground">{s.v}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </div>

        <h2 className="mt-10 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          What being a Redstream donor looks like
        </h2>
        <div className="mt-3 space-y-3">
          {[
            {
              icon: Calendar,
              title: "You decide when you're available",
              body: "Set weekdays, weekends, time slots, and an 'emergency-only' mode. Pause anytime.",
            },
            {
              icon: ShieldCheck,
              title: "Only verified, nearby requests",
              body: "Hospital-verified emergencies within your chosen radius. Never spam, never broadcast.",
            },
            {
              icon: Clock,
              title: "Cooldown is tracked for you",
              body: "We respect the 90-day window so your health stays first. You'll never be over-asked.",
            },
            {
              icon: Sparkles,
              title: "Quiet recognition",
              body: "A simple log of every life you've supported. No leaderboards, no public profiles.",
            },
          ].map((it) => (
            <div
              key={it.title}
              className="flex gap-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]"
            >
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                <it.icon className="h-5 w-5" />
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">{it.title}</div>
                <div className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {it.body}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-soft)]">
          <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
            Privacy first
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            Your phone number is masked behind our relay. Patients never see your
            personal contact. You can leave the network with one tap, anytime.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-border bg-secondary/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Questions before you join?
              </div>
              <div className="mt-1 text-sm text-foreground">
                Talk to a coordinator. We'll walk you through it.
              </div>
            </div>
            <a
              href="tel:+911140000000"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-border bg-background px-3 py-2 text-xs font-semibold text-primary"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
          </div>
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto max-w-2xl px-5 py-4">
          <Link
            to="/donor/register"
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-medium text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)]"
          >
            Register as a donor
            <ChevronRight className="h-4 w-4" />
          </Link>
          <p className="mt-2 text-center text-[11px] text-muted-foreground">
            Free · 90 seconds · You can pause anytime
          </p>
        </div>
      </div>
    </div>
  );
}