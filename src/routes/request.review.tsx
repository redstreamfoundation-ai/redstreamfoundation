import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Pencil, Droplet, Building2, MapPin, Phone, FileCheck2, Zap, Clock, Calendar, AlertCircle } from "lucide-react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useRequest, type Urgency } from "@/lib/request-store";

export const Route = createFileRoute("/request/review")({
  component: ReviewStep,
});

const URGENCY_LABEL: Record<Urgency, { label: string; hint: string; icon: typeof Zap }> = {
  critical: { label: "Critical", hint: "Within 1 hour", icon: Zap },
  "within-2h": { label: "Very urgent", hint: "Within 2 hours", icon: Clock },
  "within-24h": { label: "Urgent", hint: "Within 24 hours", icon: Clock },
  planned: { label: "Scheduled", hint: "Next 1–3 days", icon: Calendar },
};

function ReviewStep() {
  const { state } = useRequest();
  const navigate = useNavigate();

  const missing: string[] = [];
  if (!state.bloodGroup) missing.push("Blood group");
  if (!state.urgency) missing.push("Urgency");
  if (!state.hospital) missing.push("Hospital");
  if (!state.locality) missing.push("Locality");
  if (!state.attendantPhone || state.attendantPhone.length < 10) missing.push("Attendant contact");
  if (!state.proofUploaded) missing.push("Medical proof");
  const valid = missing.length === 0;

  const urgency = state.urgency ? URGENCY_LABEL[state.urgency] : null;
  const maskedPhone = state.attendantPhone
    ? `+91 ${state.attendantPhone.slice(0, 2)}•••• ${state.attendantPhone.slice(-2)}`
    : "—";

  return (
    <StepShell
      step={4}
      total={4}
      eyebrow="Review & confirm"
      title="One quick review before we go live."
      subtitle="Coordinators use this exact information to verify and dispatch nearby donors."
      footer={
        <PrimaryButton
          disabled={!valid}
          onClick={() => navigate({ to: "/request/submitted" })}
        >
          Submit emergency request <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      {!valid ? (
        <div className="mb-5 flex items-start gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-4">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <div className="text-xs leading-relaxed text-foreground">
            Please complete: <span className="font-semibold">{missing.join(", ")}</span> before submitting.
          </div>
        </div>
      ) : null}

      <SummaryCard
        title="Blood requirement"
        editTo="/request/blood"
        rows={[
          {
            icon: Droplet,
            label: "Group & component",
            value: `${state.bloodGroup || "—"} · ${state.component} · ${state.units} unit${state.units > 1 ? "s" : ""}`,
          },
          urgency
            ? {
                icon: urgency.icon,
                label: "Urgency",
                value: `${urgency.label} — ${urgency.hint}`,
              }
            : { icon: Clock, label: "Urgency", value: "Not set" },
        ]}
      />

      <SummaryCard
        title="Hospital & contact"
        editTo="/request/hospital"
        rows={[
          { icon: Building2, label: "Hospital", value: state.hospital || "—" },
          {
            icon: MapPin,
            label: "Locality",
            value: state.locality || "—",
          },
          {
            icon: Phone,
            label: "Attendant",
            value: `${state.attendantName || "Attendant"} · ${maskedPhone}`,
          },
          state.patientAge
            ? { icon: Clock, label: "Patient age", value: `${state.patientAge} yrs` }
            : null,
        ].filter(Boolean) as SummaryRow[]}
      />

      <SummaryCard
        title="Verification proof"
        editTo="/request/proof"
        rows={[
          {
            icon: FileCheck2,
            label: "Medical document",
            value: state.proofUploaded ? "Attached · pending review" : "Not uploaded",
          },
        ]}
      />

      <div className="mt-6 rounded-2xl border border-border bg-secondary/60 p-4 text-xs leading-relaxed text-muted-foreground">
        On submission, your request enters the verification queue. Coordinators
        usually clear emergency requests within 2–4 minutes and begin notifying
        nearby donors immediately after.
      </div>
    </StepShell>
  );
}

type SummaryRow = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
};

function SummaryCard({
  title,
  editTo,
  rows,
}: {
  title: string;
  editTo: string;
  rows: SummaryRow[];
}) {
  return (
    <div className="mt-4 rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)]">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </div>
        <Link
          to={editTo}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-medium text-foreground transition-colors hover:bg-secondary"
        >
          <Pencil className="h-3 w-3" /> Edit
        </Link>
      </div>
      <ul className="mt-3 space-y-3">
        {rows.map((r) => (
          <li key={r.label} className="flex items-start gap-3">
            <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary">
              <r.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                {r.label}
              </div>
              <div className="mt-0.5 truncate text-sm font-medium text-foreground">
                {r.value}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
