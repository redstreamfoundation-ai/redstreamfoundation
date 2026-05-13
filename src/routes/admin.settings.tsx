import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Bell, Radius, Lock, FileArchive, ShieldCheck } from "lucide-react";
import { Card, PageHeader } from "@/components/admin/AdminShell";

export const Route = createFileRoute("/admin/settings")({
  component: Settings,
});

function Settings() {
  const [notif, setNotif] = useState({ push: true, sms: true, whatsapp: false, email: true });
  const [defaultRadius, setDefaultRadius] = useState(5);
  const [maxRadius, setMaxRadius] = useState(15);
  const [autoExpand, setAutoExpand] = useState(true);
  const [maskContact, setMaskContact] = useState(true);
  const [hideExactLocation, setHideExactLocation] = useState(true);
  const [retention, setRetention] = useState(60);

  return (
    <>
      <PageHeader
        eyebrow="Settings"
        title="Operations & safety controls"
        subtitle="Defaults applied across the Redstream coordination network."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <SectionHeader icon={Bell} title="Notification defaults" />
          <div className="mt-4 space-y-2">
            <Toggle
              label="Push notifications"
              hint="Sent to all donor apps."
              v={notif.push}
              onToggle={() => setNotif((n) => ({ ...n, push: !n.push }))}
            />
            <Toggle
              label="SMS"
              hint="Backup channel for critical alerts."
              v={notif.sms}
              onToggle={() => setNotif((n) => ({ ...n, sms: !n.sms }))}
            />
            <Toggle
              label="WhatsApp"
              hint="For coordinator-led updates."
              v={notif.whatsapp}
              onToggle={() => setNotif((n) => ({ ...n, whatsapp: !n.whatsapp }))}
            />
            <Toggle
              label="Email digests"
              hint="Weekly summary to staff and partners."
              v={notif.email}
              onToggle={() => setNotif((n) => ({ ...n, email: !n.email }))}
            />
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={Radius} title="Matching radius" />
          <div className="mt-5 space-y-5">
            <Slider
              label="Default radius"
              hint="Initial distance from hospital to ping donors."
              value={defaultRadius}
              onChange={setDefaultRadius}
              min={2}
              max={15}
              suffix="km"
            />
            <Slider
              label="Maximum auto-expansion"
              hint="Cap on radius growth before coordinator review."
              value={maxRadius}
              onChange={setMaxRadius}
              min={5}
              max={25}
              suffix="km"
            />
            <Toggle
              label="Auto-expand radius"
              hint="Grow by 2 km every 5 minutes if no match."
              v={autoExpand}
              onToggle={() => setAutoExpand((v) => !v)}
            />
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={Lock} title="Privacy controls" />
          <div className="mt-4 space-y-2">
            <Toggle
              label="Mask donor & attendant contact"
              hint="All calls and SMS go through Redstream relay."
              v={maskContact}
              onToggle={() => setMaskContact((v) => !v)}
            />
            <Toggle
              label="Hide exact donor location"
              hint="Show approximate zone only until acceptance."
              v={hideExactLocation}
              onToggle={() => setHideExactLocation((v) => !v)}
            />
            <div className="rounded-xl border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck className="mr-1 inline h-3.5 w-3.5 text-emerald-600" />
              Donors and patients see masked phone numbers and a city-level
              location until a match is confirmed.
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <SectionHeader icon={FileArchive} title="Proof retention" />
          <Slider
            label="Hospital requisition retention"
            hint="Auto-deleted after this many days."
            value={retention}
            onChange={setRetention}
            min={7}
            max={180}
            suffix="days"
          />
          <div className="mt-4 rounded-xl border border-border bg-secondary/40 p-4 text-xs leading-relaxed text-muted-foreground">
            Proofs are encrypted at rest and accessible only to verified coordinators.
            Audit log retains a hash for {retention} days after deletion.
          </div>
        </Card>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button className="rounded-lg border border-border bg-background px-4 py-2 text-xs font-semibold text-foreground hover:bg-secondary">
          Discard changes
        </button>
        <button className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground shadow-[var(--shadow-glow)]">
          Save settings
        </button>
      </div>
    </>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <h2 className="text-sm font-semibold text-foreground">{title}</h2>
    </div>
  );
}

function Toggle({
  label,
  hint,
  v,
  onToggle,
}: {
  label: string;
  hint: string;
  v: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-background p-3">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-foreground">{label}</div>
        <div className="mt-0.5 text-[11px] text-muted-foreground">{hint}</div>
      </div>
      <button
        onClick={onToggle}
        aria-label={`Toggle ${label}`}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          v ? "bg-primary" : "bg-secondary"
        }`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-background shadow transition-transform ${
            v ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function Slider({
  label,
  hint,
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  label: string;
  hint: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  suffix: string;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-sm font-medium text-foreground">{label}</div>
          <div className="text-[11px] text-muted-foreground">{hint}</div>
        </div>
        <div className="font-serif-display text-2xl text-foreground">
          {value}
          <span className="ml-1 text-xs text-muted-foreground">{suffix}</span>
        </div>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-3 w-full accent-[oklch(0.52_0.22_25)]"
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>
          {min} {suffix}
        </span>
        <span>
          {max} {suffix}
        </span>
      </div>
    </div>
  );
}