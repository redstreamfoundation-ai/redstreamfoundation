import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bell,
  ChevronRight,
  Clock,
  Droplet,
  HeartPulse,
  MapPin,
  Settings,
  Power,
  Phone,
  MessageSquare,
  Smartphone,
  Moon,
  Calendar,
  X,
} from "lucide-react";
import { Logo } from "@/components/landing/Logo";
import { useDonor } from "@/lib/donor-store";

export const Route = createFileRoute("/donor/dashboard")({
  component: Dashboard,
  head: () => ({
    meta: [
      { title: "Donor dashboard — Redstream Foundation" },
      {
        name: "description",
        content:
          "Your Redstream donor dashboard: availability status, impact metrics, nearby requests, cooldown tracker, and notification settings.",
      },
      { property: "og:title", content: "Donor dashboard — Redstream Foundation" },
      {
        property: "og:description",
        content:
          "Track your donations, availability, and nearby emergency requests.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/donor/dashboard" },
      { name: "robots", content: "noindex" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/donor-dashboard.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/donor-dashboard.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/donor/dashboard" }],
  }),
});

const NEARBY: Array<{
  id: string;
  group: string;
  units: number;
  hospital: string;
  zone: string;
  km: number;
  urgency: string;
  posted: string;
}> = [];

function Dashboard() {
  const { state, update } = useDonor();
  const name = state.fullName?.split(" ")[0] || "Friend";
  const lastDonation = state.lastDonation || "";
  const hasDonated = Boolean(lastDonation);
  const eligibleOn = hasDonated ? computeEligibility(lastDonation) : "";
  const cooldownDays = hasDonated ? daysUntil(eligibleOn) : 0;
  const cooldownPct = hasDonated
    ? Math.min(100, Math.max(0, ((90 - cooldownDays) / 90) * 100))
    : 0;

  const decision = state.lastDecision;
  const setNotif = (k: keyof typeof state.notifications) =>
    update({ notifications: { ...state.notifications, [k]: !state.notifications[k] } });

  return (
    <div className="min-h-screen bg-background pb-12">
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5 md:px-8">
          <Logo />
          <button
            aria-label="Settings"
            className="grid h-9 w-9 place-items-center rounded-full border border-border bg-background text-muted-foreground transition-colors hover:text-foreground"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        {decision ? (
          <div className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-border bg-secondary/60 p-4 animate-slide-up">
            <div className="flex items-start gap-3">
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
                {decision.kind === "later" ? (
                  <Calendar className="h-4 w-4" />
                ) : decision.kind === "declined" ? (
                  <X className="h-4 w-4" />
                ) : (
                  <HeartPulse className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-foreground">
                  {decision.kind === "later"
                    ? `Reminder set for ${decision.inHours}h`
                    : decision.kind === "declined"
                    ? "Marked unavailable for that request"
                    : "Request accepted"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {decision.kind === "later"
                    ? "We'll ping you only if it's still open."
                    : decision.kind === "declined"
                    ? "Routed to the next nearest donor — no impact on your status."
                    : "See coordination details for next steps."}
                </div>
              </div>
            </div>
            <button
              onClick={() => update({ lastDecision: null })}
              aria-label="Dismiss"
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-muted-foreground hover:bg-background"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : null}

        <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
          Welcome back
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Hello, <span className="font-serif-display italic text-primary">{name}.</span>
        </h1>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
        {/* Status card */}
        <section className="overflow-hidden rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-elevated)]">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="relative flex h-2.5 w-2.5">
                {state.active ? (
                  <>
                    <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-70 animate-pulse-ring" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
                  </>
                ) : (
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-muted-foreground" />
                )}
              </span>
              <div>
                <div className="text-sm font-semibold text-foreground">
                  {state.active ? "Active and listening" : "Paused"}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {state.bloodGroup || "—"} · {state.locality || "Delhi NCR"} · within{" "}
                  {state.radiusKm} km
                </div>
              </div>
            </div>
            <button
              onClick={() => update({ active: !state.active })}
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                state.active
                  ? "border-border bg-background text-foreground hover:bg-secondary"
                  : "border-primary bg-primary text-primary-foreground"
              }`}
            >
              <Power className="h-3.5 w-3.5" />
              {state.active ? "Pause" : "Resume"}
            </button>
          </div>
        </section>

        {/* Impact metrics */}
        <section className="grid grid-cols-3 gap-3">
          {[
            { v: "0", l: "Donations" },
            { v: "0", l: "Lives helped" },
            { v: hasDonated ? "Active" : "New", l: "With Redstream" },
          ].map((s) => (
            <div
              key={s.l}
              className="rounded-2xl border border-border bg-card p-4 text-center shadow-[var(--shadow-soft)]"
            >
              <div className="font-serif-display text-2xl text-foreground">{s.v}</div>
              <div className="mt-1 text-[11px] text-muted-foreground">{s.l}</div>
            </div>
          ))}
        </section>

        {/* Cooldown */}
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">Donation cooldown</span>
            </div>
            <span className="text-xs text-muted-foreground">
              {!hasDonated ? "Eligible now" : cooldownDays > 0 ? `${cooldownDays} days left` : "Eligible now"}
            </span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-[var(--gradient-emergency)] transition-all"
              style={{ width: `${cooldownPct}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>Last donation · {hasDonated ? formatDate(lastDonation) : "No donations yet"}</span>
            <span>Eligible · {hasDonated ? formatDate(eligibleOn) : "Now"}</span>
          </div>
        </section>

        {/* Nearby requests */}
        <section>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-primary">
                Nearby requests
              </div>
              <h2 className="mt-1 text-lg font-semibold text-foreground">
                {NEARBY.length === 0
                  ? "No active requests right now"
                  : `${NEARBY.length} verified, within your radius`}
              </h2>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live
            </span>
          </div>

          {NEARBY.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-8 text-center">
              <div className="mx-auto grid h-10 w-10 place-items-center rounded-full bg-primary/10 text-primary">
                <HeartPulse className="h-4 w-4" />
              </div>
              <div className="mt-3 text-sm font-medium text-foreground">You're all set.</div>
              <div className="mt-1 text-xs text-muted-foreground">
                We'll notify you here the moment a verified request matches your blood group and radius.
              </div>
            </div>
          ) : (
          <div className="mt-4 space-y-3">
            {NEARBY.map((r) => (
              <Link
                key={r.id}
                to="/donor/request"
                className="block rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-all hover:border-primary/40 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[var(--gradient-emergency)] text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
                      <Droplet className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-semibold text-foreground">
                          {r.group}
                        </span>
                        <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                          {r.units} unit{r.units > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3 w-3" /> {r.zone} · {r.km} km
                      </div>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 font-medium text-primary">
                    <HeartPulse className="h-3 w-3" /> {r.urgency}
                  </span>
                  <span className="text-muted-foreground">{r.posted}</span>
                </div>
              </Link>
            ))}
          </div>
          )}
        </section>

        {/* Notification settings */}
        </div>
        <div className="space-y-6">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold text-foreground">Notification settings</div>
              <div className="mt-0.5 text-xs text-muted-foreground">
                Choose how Redstream reaches you for emergencies.
              </div>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <NotifRow
              icon={Smartphone}
              title="Push notifications"
              hint="Instant alert on this device."
              active={state.notifications.push}
              onToggle={() => setNotif("push")}
            />
            <NotifRow
              icon={MessageSquare}
              title="SMS"
              hint="Backup if the app is closed."
              active={state.notifications.sms}
              onToggle={() => setNotif("sms")}
            />
            <NotifRow
              icon={Phone}
              title="WhatsApp"
              hint="Coordinator messages on WhatsApp."
              active={state.notifications.whatsapp}
              onToggle={() => setNotif("whatsapp")}
            />
            <NotifRow
              icon={Moon}
              title="Quiet hours (10 pm — 6 am)"
              hint="Only critical sub-1-hour alerts during sleep."
              active={state.notifications.quietHours}
              onToggle={() => setNotif("quietHours")}
            />
          </div>

          <Link
            to="/donor/availability"
            className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-primary"
          >
            Edit availability and radius <ChevronRight className="h-3 w-3" />
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-secondary/60 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Need to talk to someone?
              </div>
              <div className="mt-1 text-sm text-foreground">
                Coordinators are available 24/7.
              </div>
            </div>
            <a
              href="tel:+911140000000"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground"
            >
              <Phone className="h-3.5 w-3.5" /> Call
            </a>
          </div>
        </section>
        </div>
        </div>
      </main>
    </div>
  );
}

function NotifRow({
  icon: Icon,
  title,
  hint,
  active,
  onToggle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  hint: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-background p-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{title}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <button
        onClick={onToggle}
        aria-label={`Toggle ${title}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          active ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
            active ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function computeEligibility(last: string): string {
  const d = new Date(last);
  if (isNaN(d.getTime())) return "";
  d.setDate(d.getDate() + 90);
  return d.toISOString().slice(0, 10);
}
function daysUntil(iso: string): number {
  if (!iso) return 0;
  const ms = new Date(iso).getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
function formatDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}