import { ArrowRight, HeartPulse } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { LiveBadge } from "./LiveBadge";

const ACTIVITY = [
  "Donor matched in Lajpat Nagar · just now",
  "O- request fulfilled near AIIMS · 2 min ago",
  "3 donors en route in Dwarka · 4 min ago",
  "B+ request verified in Rohini · 6 min ago",
];

export function Hero() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % ACTIVITY.length), 3200);
    return () => clearInterval(t);
  }, []);

  return (
    <section id="request" className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-40 h-[420px] bg-[radial-gradient(60%_60%_at_50%_0%,oklch(0.52_0.22_25/0.12),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl px-5 pb-16 pt-12 md:pt-20 lg:pt-24">
        <div className="flex flex-col items-start gap-6 md:items-center md:text-center">
          <LiveBadge label={ACTIVITY[i]} />

          <h1 className="max-w-3xl text-[2.4rem] font-semibold leading-[1.05] tracking-tight text-foreground md:text-6xl">
            When blood is urgent,{" "}
            <span className="font-serif-display italic text-primary">every minute</span>{" "}
            matters.
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            Redstream Foundation helps connect patients with nearby volunteer blood
            donors during medical emergencies across Delhi.
          </p>

          <div className="flex w-full flex-col gap-3 pt-2 sm:flex-row md:w-auto md:justify-center">
            <Link
              to="/request"
              className="group inline-flex items-center justify-center gap-2 rounded-full px-8 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:scale-[1.02]"
              style={{ backgroundImage: "var(--gradient-emergency)", backgroundColor: "var(--primary-deep)" }}
            >
              <HeartPulse className="h-5 w-5" />
              Request blood
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/donor"
              className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary bg-transparent px-7 py-3.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/5"
            >
              Become a donor
            </Link>
          </div>

          <div className="mt-6 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex h-1.5 w-1.5 rounded-full bg-primary animate-pulse-dot" />
            12 emergencies handled in Delhi this week
          </div>
        </div>
      </div>
    </section>
  );
}