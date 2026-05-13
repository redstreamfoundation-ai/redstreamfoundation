import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronRight, User, Phone, MapPin, Briefcase, Calendar, Droplet, Check } from "lucide-react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useDonor } from "@/lib/donor-store";

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
  const [otpSent, setOtpSent] = useState(false);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (!otpSent || seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpSent, seconds]);

  const sendOtp = () => {
    if (state.phone.length < 10) return;
    setOtpSent(true);
    setSeconds(30);
  };

  const verify = () => {
    if (state.otp.length !== 4) return;
    update({ otpVerified: true });
  };

  const valid =
    state.fullName.trim() &&
    state.otpVerified &&
    state.bloodGroup &&
    state.locality.trim() &&
    state.pincode.length === 6;

  return (
    <StepShell
      eyebrow="Donor registration"
      title="Let's set up your donor profile."
      subtitle="A quick one-time setup. You can edit anything later from your dashboard."
      footer={
        <PrimaryButton
          disabled={!valid}
          onClick={() => navigate({ to: "/donor/availability" })}
        >
          Continue to availability <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
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
                value={state.phone}
                onChange={(e) =>
                  update({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })
                }
                placeholder="10-digit mobile"
                inputMode="tel"
                disabled={state.otpVerified}
                className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
            <button
              onClick={sendOtp}
              disabled={state.phone.length < 10 || state.otpVerified || (otpSent && seconds > 0)}
              className="shrink-0 rounded-2xl border border-border bg-background px-4 text-xs font-semibold text-primary transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {state.otpVerified
                ? "Verified"
                : !otpSent
                ? "Send OTP"
                : seconds > 0
                ? `${seconds}s`
                : "Resend"}
            </button>
          </div>
        </div>

        {otpSent && !state.otpVerified ? (
          <div className="mt-3 rounded-2xl border border-border bg-secondary/60 p-4 animate-slide-up">
            <Label>Enter the 4-digit code we just sent</Label>
            <div className="mt-3 flex items-center gap-3">
              <input
                value={state.otp}
                onChange={(e) => update({ otp: e.target.value.replace(/\D/g, "").slice(0, 4) })}
                placeholder="• • • •"
                inputMode="numeric"
                className="w-32 rounded-xl border border-border bg-background px-4 py-3 text-center font-mono text-lg tracking-[0.4em] text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <button
                onClick={verify}
                disabled={state.otp.length !== 4}
                className="rounded-full bg-primary px-4 py-2.5 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                Verify
              </button>
            </div>
          </div>
        ) : null}

        {state.otpVerified ? (
          <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-700 animate-slide-up">
            <Check className="h-3.5 w-3.5" /> Number verified
          </div>
        ) : null}
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
          <Field
            icon={Calendar}
            label="Last donation date"
            placeholder="YYYY-MM-DD"
            value={state.lastDonation}
            onChange={(v) => update({ lastDonation: v.slice(0, 10) })}
          />
        </div>
      </Section>
    </StepShell>
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