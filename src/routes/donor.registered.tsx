import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, LayoutDashboard, Heart } from "lucide-react";
import { StepShell } from "@/components/request/StepShell";

export const Route = createFileRoute("/donor/registered")({
  component: DonorRegistered,
  head: () => ({
    meta: [
      { title: "You're registered — Redstream Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function DonorRegistered() {
  return (
    <StepShell
      eyebrow="Registration complete"
      title="You're on the donor network."
      subtitle="Your profile and availability are saved. We'll only reach out for matched, verified emergencies near you."
      showBack={false}
      footer={
        <Link
          to="/donor/dashboard"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)]"
        >
          <LayoutDashboard className="h-4 w-4" /> View status
          <ArrowRight className="h-4 w-4" />
        </Link>
      }
    >
      <div className="grid place-items-center py-4">
        <div className="relative h-28 w-28">
          <span className="absolute inset-0 rounded-full bg-primary/15 animate-pulse-ring" />
          <span className="absolute inset-3 rounded-full bg-primary/20 animate-pulse-ring [animation-delay:300ms]" />
          <div className="relative grid h-28 w-28 place-items-center rounded-full bg-[var(--gradient-emergency)] text-primary-foreground shadow-[var(--shadow-glow)]">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-primary/20 bg-[var(--gradient-soft)] p-6 shadow-[var(--shadow-soft)]">
        <div className="flex items-center gap-3">
          <Heart className="h-5 w-5 text-primary" />
          <div className="text-sm font-semibold text-foreground">Thank you for showing up.</div>
        </div>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          You can update availability, pause notifications, or change your radius any time from your dashboard.
        </p>
      </div>
    </StepShell>
  );
}