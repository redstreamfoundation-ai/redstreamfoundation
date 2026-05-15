import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, User, Phone, MapPin, Briefcase, Calendar as CalendarIcon, Droplet, Check } from "lucide-react";
import { format, parseISO, isValid } from "date-fns";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useDonor } from "@/lib/donor-store";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/integrations/supabase/client";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/donor/register")({
  component: DonorRegister,
  head: () => ({
    meta: [
      { title: "Donor registration — Redstream Foundation" },
      {
        name: "description",
        content:
          "Register as a Redstream emergency blood donor in Delhi: phone OTP verification, blood group, locality, and last donation date.",
      },
      { property: "og:title", content: "Donor registration — Redstream Foundation" },
      {
        property: "og:description",
        content:
          "Quick, verified sign-up for Delhi's emergency blood donor network.",
      },
      { property: "og:url", content: "https://redstreamfoundation.lovable.app/donor/register" },
      { property: "og:image", content: "https://redstreamfoundation.lovable.app/og/donor-register.jpg" },
      { name: "twitter:image", content: "https://redstreamfoundation.lovable.app/og/donor-register.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://redstreamfoundation.lovable.app/donor/register" }],
  }),
});

const GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

function DonorRegister() {
  const { state, update } = useDonor();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/auth", search: { redirect: "/donor/register" }, replace: true });
      return;
    }
    // The user signed in via mobile OTP — their phone is already verified.
    const verifiedPhone = (user.phone || "").replace(/\D/g, "").replace(/^91/, "").slice(-10);
    if (verifiedPhone) {
      update({ phone: verifiedPhone, otpVerified: true });
    }
    (async () => {
      const { data } = await supabase.from("donors").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        update({
          fullName: data.full_name,
          phone: data.phone,
          otpVerified: true,
          bloodGroup: data.blood_group,
          locality: data.locality,
          pincode: data.pincode,
          profession: data.profession ?? "",
          lastDonation: data.last_donation_date ?? "",
        });
      } else {
        // First-time donor: prefill from saved profile (full_name, phone)
        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, phone")
          .eq("user_id", user.id)
          .maybeSingle();
        if (prof) {
          update({
            fullName: prof.full_name || "",
            phone: (prof.phone || "").replace(/\D/g, "").slice(-10),
          });
        }
      }
    })();
  }, [user, loading, navigate, update]);

  const valid =
    state.fullName.trim() &&
    state.otpVerified &&
    state.bloodGroup &&
    state.locality.trim() &&
    state.pincode.length === 6;

  const saveAndContinue = async () => {
    if (!user) return;
    setSaving(true);
    setError(null);
    const { error } = await supabase.from("donors").upsert(
      {
        user_id: user.id,
        full_name: state.fullName,
        phone: state.phone,
        blood_group: state.bloodGroup,
        locality: state.locality,
        pincode: state.pincode,
        profession: state.profession || null,
        last_donation_date: state.lastDonation || null,
      },
      { onConflict: "user_id" },
    );
    setSaving(false);
    if (error) {
      setError(error.message);
      return;
    }
    navigate({ to: "/donor/availability" });
  };

  return (
    <StepShell
      eyebrow="Donor registration"
      title="Let's set up your donor profile."
      subtitle="A quick one-time setup. You can edit anything later from your dashboard."
      footer={
        <PrimaryButton
          disabled={!valid || saving}
          onClick={saveAndContinue}
        >
          {saving ? "Saving…" : "Continue to availability"} <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      {error ? (
        <div className="mb-4 rounded-2xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
          {error}
        </div>
      ) : null}
      <Section title="Identity">
        <Field
          icon={User}
          label="Full name"
          placeholder="As per your ID"
          value={state.fullName}
          onChange={(v) => update({ fullName: v.slice(0, 80) })}
        />
        <div className="mt-3">
          <Label>Phone number</Label>
          <div className="mt-2 flex gap-2">
            <div className="relative flex-1">
              <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={state.phone ? `+91 ${state.phone}` : ""}
                readOnly
                disabled
                inputMode="tel"
                className="w-full rounded-2xl border border-border bg-secondary/40 py-3.5 pl-11 pr-4 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none disabled:cursor-not-allowed"
              />
            </div>
            <span className="inline-flex shrink-0 items-center gap-1.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 text-xs font-semibold text-emerald-700">
              <Check className="h-3.5 w-3.5" /> Verified
            </span>
          </div>
          <p className="mt-1.5 text-[11px] text-muted-foreground">
            Verified at sign-in. Contact support to change your registered number.
          </p>
        </div>
      </Section>

      <Section title="Donation profile">
        <Label>Blood group</Label>
        <div className="mt-3 grid grid-cols-4 gap-2">
          {GROUPS.map((g) => {
            const active = state.bloodGroup === g;
            return (
              <button
                key={g}
                onClick={() => update({ bloodGroup: g })}
                className={`flex flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-sm font-semibold transition-all ${
                  active
                    ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                    : "border-border bg-card text-foreground hover:border-primary/40"
                }`}
              >
                <Droplet className={`h-4 w-4 ${active ? "" : "text-primary"}`} />
                {g}
              </button>
            );
          })}
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Field
            icon={MapPin}
            label="Locality"
            placeholder="e.g. Saket, Dwarka"
            value={state.locality}
            onChange={(v) => update({ locality: v.slice(0, 60) })}
          />
          <Field
            label="PIN code"
            placeholder="6-digit"
            value={state.pincode}
            onChange={(v) => update({ pincode: v.replace(/\D/g, "").slice(0, 6) })}
            inputMode="numeric"
          />
        </div>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Field
            icon={Briefcase}
            label="Profession (optional)"
            placeholder="e.g. Engineer, Teacher"
            value={state.profession}
            onChange={(v) => update({ profession: v.slice(0, 60) })}
          />
          <DateField
            label="Last donation date"
            value={state.lastDonation}
            onChange={(v) => update({ lastDonation: v })}
          />
        </div>
      </Section>
    </StepShell>
  );
}

function DateField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const parsed = value ? parseISO(value) : undefined;
  const selected = parsed && isValid(parsed) ? parsed : undefined;
  return (
    <div className="block">
      <Label>{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className={cn(
              "mt-2 flex w-full items-center gap-3 rounded-2xl border border-border bg-background py-3.5 pl-4 pr-4 text-left text-sm shadow-[var(--shadow-soft)] outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/20",
              !selected && "text-muted-foreground",
            )}
          >
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
            {selected ? format(selected, "PPP") : "Pick a date"}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selected}
            onSelect={(d) => onChange(d ? format(d, "yyyy-MM-dd") : "")}
            disabled={(date) => date > new Date() || date < new Date("1980-01-01")}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-2">
      <div className="mb-3 text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
        {title}
      </div>
      <div className="rounded-3xl border border-border bg-card/40 p-5 shadow-[var(--shadow-soft)]">
        {children}
      </div>
      <div className="h-6" />
    </section>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
      {children}
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  inputMode,
}: {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  inputMode?: "text" | "tel" | "numeric" | "email";
}) {
  return (
    <label className="block">
      <Label>{label}</Label>
      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          className={`w-full rounded-2xl border border-border bg-background py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            Icon ? "pl-11 pr-4" : "px-4"
          }`}
        />
      </div>
    </label>
  );
}