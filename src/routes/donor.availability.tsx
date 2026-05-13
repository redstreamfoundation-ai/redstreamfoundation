import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, Sun, Sunset, Moon, Sunrise, Zap, Power, Loader2 } from "lucide-react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useDonor } from "@/lib/donor-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/donor/availability")({
  component: Availability,
  head: () => ({
    meta: [
      { title: "Set donor availability — Redstream Foundation" },
      {
        name: "description",
        content:
          "Choose the days, time slots, donation radius, and emergency-only mode for your Redstream donor profile in Delhi NCR.",
      },
      { property: "og:title", content: "Set donor availability — Redstream Foundation" },
      {
        property: "og:description",
        content: "Configure when and where you can respond to verified emergency blood requests.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/donor/availability" },
      { name: "robots", content: "noindex" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/donor-availability.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/donor-availability.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/donor/availability" }],
  }),
});

const SLOTS = [
  { key: "morning", label: "Morning", hint: "6 — 12", icon: Sunrise },
  { key: "afternoon", label: "Afternoon", hint: "12 — 5", icon: Sun },
  { key: "evening", label: "Evening", hint: "5 — 9", icon: Sunset },
  { key: "night", label: "Night", hint: "9 — 6", icon: Moon },
] as const;

function Availability() {
  const { state, update, toggleSlot } = useDonor();
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [hydrated, setHydrated] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/donor/availability" }, replace: true });
      return;
    }
    (async () => {
      const { data } = await supabase
        .from("donor_availability")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      if (data) {
        update({
          weekdays: data.weekdays,
          weekends: data.weekends,
          slots: {
            morning: data.slot_morning,
            afternoon: data.slot_afternoon,
            evening: data.slot_evening,
            night: data.slot_night,
          },
          emergencyOnly: data.emergency_only,
          radiusKm: data.radius_km,
          active: data.active,
          notifications: {
            push: data.notify_push,
            sms: data.notify_sms,
            whatsapp: data.notify_whatsapp,
            quietHours: data.quiet_hours,
          },
        });
      }
      setHydrated(true);
    })();
  }, [user, loading, navigate, update]);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("donor_availability").upsert(
      {
        user_id: user.id,
        weekdays: state.weekdays,
        weekends: state.weekends,
        slot_morning: state.slots.morning,
        slot_afternoon: state.slots.afternoon,
        slot_evening: state.slots.evening,
        slot_night: state.slots.night,
        emergency_only: state.emergencyOnly,
        radius_km: state.radiusKm,
        active: state.active,
        notify_push: state.notifications.push,
        notify_sms: state.notifications.sms,
        notify_whatsapp: state.notifications.whatsapp,
        quiet_hours: state.notifications.quietHours,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/donor/dashboard" });
  };

  if (loading || !hydrated) {
    return (
      <div className="grid min-h-screen place-items-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <StepShell
      eyebrow="Availability"
      title="When can we reach you?"
      subtitle="Saved to your profile. Update anytime from the dashboard."
      footer={
        <PrimaryButton onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save and continue"} <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      {error ? (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          {error}
        </div>
      ) : null}
      <Block label="Days of the week">
        <div className="grid grid-cols-2 gap-3">
          <Toggle active={state.weekdays} onClick={() => update({ weekdays: !state.weekdays })} title="Weekdays" hint="Mon — Fri" />
          <Toggle active={state.weekends} onClick={() => update({ weekends: !state.weekends })} title="Weekends" hint="Sat — Sun" />
        </div>
      </Block>

      <Block label="Time of day">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {SLOTS.map((s) => {
            const active = state.slots[s.key];
            return (
              <button
                key={s.key}
                onClick={() => toggleSlot(s.key)}
                className={`flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all ${
                  active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-card hover:border-primary/40"
                }`}
              >
                <span className={`grid h-8 w-8 place-items-center rounded-lg ${active ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"}`}>
                  <s.icon className="h-4 w-4" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">{s.label}</div>
                  <div className="text-[11px] text-muted-foreground">{s.hint}</div>
                </div>
              </button>
            );
          })}
        </div>
      </Block>

      <Block label="Donation radius">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Travel up to</span>
            <span className="font-serif-display text-3xl text-foreground">
              {state.radiusKm}<span className="ml-1 text-sm text-muted-foreground">km</span>
            </span>
          </div>
          <input
            type="range"
            min={2}
            max={25}
            value={state.radiusKm}
            onChange={(e) => update({ radiusKm: Number(e.target.value) })}
            className="mt-4 w-full accent-[oklch(0.52_0.22_25)]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>2 km</span><span>25 km</span>
          </div>
        </div>
      </Block>

      <Block label="Mode">
        <Row icon={Zap} title="Emergency-only mode" hint="Only ping me for critical, sub-1-hour requests." active={state.emergencyOnly} onToggle={() => update({ emergencyOnly: !state.emergencyOnly })} />
        <div className="h-3" />
        <Row icon={Power} title={state.active ? "Currently active" : "Currently paused"} hint="Pause anytime — we'll stop reaching out until you return." active={state.active} onToggle={() => update({ active: !state.active })} />
      </Block>
    </StepShell>
  );
}

function Block({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="mb-3 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      {children}
    </section>
  );
}

function Toggle({ active, onClick, title, hint }: { active: boolean; onClick: () => void; title: string; hint: string }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-2xl border p-4 text-left transition-all ${
        active ? "border-primary bg-primary/5 shadow-[var(--shadow-soft)]" : "border-border bg-card hover:border-primary/40"
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-foreground">{title}</span>
        <span className={`relative h-5 w-9 rounded-full transition-colors ${active ? "bg-primary" : "bg-secondary"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-background shadow transition-transform ${active ? "translate-x-4" : "translate-x-0.5"}`} />
        </span>
      </div>
      <div className="mt-1 text-[11px] text-muted-foreground">{hint}</div>
    </button>
  );
}

function Row({ icon: Icon, title, hint, active, onToggle }: { icon: React.ComponentType<{ className?: string }>; title: string; hint: string; active: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-foreground">{title}</div>
        <div className="mt-0.5 text-xs text-muted-foreground">{hint}</div>
      </div>
      <button
        onClick={onToggle}
        aria-label="Toggle"
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${active ? "bg-primary" : "bg-secondary"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${active ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}
