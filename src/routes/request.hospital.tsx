import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Building2, MapPin, User, Phone } from "lucide-react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { Combobox } from "@/components/request/Combobox";
import { DELHI_HOSPITALS, DELHI_LOCALITIES } from "@/lib/delhi-data";
import { useRequest } from "@/lib/request-store";

export const Route = createFileRoute("/request/hospital")({
  component: HospitalStep,
});

function HospitalStep() {
  const { state, update } = useRequest();
  const navigate = useNavigate();
  const valid =
    state.hospital.trim() &&
    state.locality.trim() &&
    state.patientAge.trim() &&
    state.attendantPhone.trim().length >= 10;

  return (
    <StepShell
      step={2}
      total={4}
      eyebrow="Hospital details"
      title="Where is the patient?"
      subtitle="We share these only with verified, matched donors."
      footer={
        <PrimaryButton
          disabled={!valid}
          onClick={() => navigate({ to: "/request/proof" })}
        >
          Continue <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      <div className="space-y-4">
        <Combobox
          icon={Building2}
          label="Hospital name"
          placeholder="Search hospitals — e.g. Ganga Ram, AIIMS, Apollo"
          value={state.hospital}
          onChange={(v) => update({ hospital: v })}
          options={DELHI_HOSPITALS}
          emptyHint="Hospital not listed — we'll still accept what you typed"
        />
        <Combobox
          icon={MapPin}
          label="Locality / area"
          placeholder="Search locality — e.g. Dwarka, Saket, Noida 62"
          value={state.locality}
          onChange={(v) => update({ locality: v })}
          options={DELHI_LOCALITIES}
          emptyHint="Locality not listed — type what works"
        />
        <div className="grid grid-cols-2 gap-3">
          <Field
            icon={User}
            label="Patient age"
            placeholder="e.g. 47"
            value={state.patientAge}
            onChange={(v) => update({ patientAge: v.replace(/\D/g, "").slice(0, 3) })}
            inputMode="numeric"
          />
          <Field
            label="Attendant name"
            placeholder="Optional"
            value={state.attendantName}
            onChange={(v) => update({ attendantName: v.slice(0, 60) })}
          />
        </div>
        <Field
          icon={Phone}
          label="Attendant contact"
          placeholder="10-digit mobile number"
          value={state.attendantPhone}
          onChange={(v) => update({ attendantPhone: v.replace(/\D/g, "").slice(0, 10) })}
          inputMode="tel"
        />

        <div className="rounded-2xl border border-border bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
          Your number is masked. Donors reach you through Redstream's relay so your
          personal contact is never shared publicly.
        </div>
      </div>
    </StepShell>
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
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        ) : null}
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          inputMode={inputMode}
          maxLength={120}
          className={`w-full rounded-2xl border border-border bg-card py-3.5 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 ${
            Icon ? "pl-11 pr-4" : "px-4"
          }`}
        />
      </div>
    </label>
  );
}