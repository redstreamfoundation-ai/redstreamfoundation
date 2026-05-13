import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ChevronRight, Upload, FileText, Image as ImageIcon, ShieldCheck, Check } from "lucide-react";
import { useState } from "react";
import { PrimaryButton, StepShell } from "@/components/request/StepShell";
import { useRequest } from "@/lib/request-store";

export const Route = createFileRoute("/request/proof")({
  component: ProofStep,
});

function ProofStep() {
  const { state, update } = useRequest();
  const navigate = useNavigate();
  const [fileName, setFileName] = useState<string | null>(null);

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    update({ proofUploaded: true });
  };

  return (
    <StepShell
      step={3}
      total={4}
      eyebrow="Proof of request"
      title="Upload a hospital document"
      subtitle="A blood requisition slip, doctor's note, or patient admission slip works."
      footer={
        <PrimaryButton
          disabled={!state.proofUploaded}
          onClick={() => navigate({ to: "/request/review" })}
        >
          Continue to review <ChevronRight className="h-4 w-4" />
        </PrimaryButton>
      }
    >
      <label className="block">
        <input
          type="file"
          accept="image/*,application/pdf"
          className="sr-only"
          onChange={onFile}
        />
        <div
          className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 text-center transition-colors ${
            state.proofUploaded
              ? "border-primary/40 bg-primary/5"
              : "border-border bg-card hover:border-primary/40"
          }`}
        >
          <div
            className={`grid h-14 w-14 place-items-center rounded-2xl ${
              state.proofUploaded
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
            }`}
          >
            {state.proofUploaded ? <Check className="h-6 w-6" /> : <Upload className="h-6 w-6" />}
          </div>
          <div>
            <div className="text-sm font-semibold text-foreground">
              {state.proofUploaded ? "Document attached" : "Tap to upload document"}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">
              {fileName ?? "JPG, PNG, or PDF · up to 10 MB"}
            </div>
          </div>
        </div>
      </label>

      <div className="mt-6">
        <div className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          Examples of accepted proof
        </div>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: "Requisition slip", icon: FileText },
            { label: "Doctor's note", icon: FileText },
            { label: "Admission slip", icon: ImageIcon },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-secondary/50 p-3 text-center"
            >
              <div className="mx-auto grid aspect-[3/4] place-items-center rounded-xl border border-dashed border-border bg-background">
                <s.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="mt-2 text-[11px] text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-[var(--shadow-soft)]">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div className="text-xs leading-relaxed text-muted-foreground">
          Documents are encrypted in transit, reviewed only by our verification team,
          and never shown to donors. They are deleted 30 days after the request closes.
        </div>
      </div>
    </StepShell>
  );
}