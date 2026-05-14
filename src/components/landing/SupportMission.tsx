import { useState } from "react";
import { Heart, Mail, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const AMOUNTS = [50, 100, 500, 1000, 2500];

export function SupportMission() {
  const [selected, setSelected] = useState<number | "custom">(500);
  const [custom, setCustom] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amount =
    selected === "custom" ? Math.floor(Number(custom) || 0) : selected;
  const validAmount = amount > 0 && amount <= 10_000_000;
  const validEmail =
    email.trim().length === 0 ||
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const onSubmit = async () => {
    if (!validAmount || !validEmail || submitting) return;
    setSubmitting(true);
    setError(null);
    const { error } = await supabase.from("donation_intents").insert({
      amount,
      email: email.trim() || null,
      name: name.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      setError("Couldn't record your interest. Please try again or email us.");
      return;
    }
    setSubmitted(true);
  };

  return (
    <section
      id="donate"
      aria-label="Support the mission"
      className="px-5 py-16 md:py-24"
    >
      <div className="mx-auto max-w-3xl">
        <div className="overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)] md:p-12">
          <div className="flex flex-col items-start gap-6 md:items-center md:text-center">
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.16em] text-primary">
              <Heart className="h-3 w-3 fill-current" /> Support
            </span>

            <h2 className="font-serif-display text-3xl font-normal leading-tight tracking-tight text-foreground md:text-5xl">
              Support the Mission
            </h2>

            <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              Donations fund coordinator operations, donor verification, and 24/7
              helpline costs — so every emergency request reaches a real human,
              fast.
            </p>
          </div>

          <div className="mt-10">
            <div className="text-center text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Every contribution counts — choose an amount
            </div>
            <div className="mx-auto mt-4 grid max-w-xl grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-3">
              {AMOUNTS.map((amt) => {
                const active = selected === amt;
                return (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setSelected(amt);
                      setCustom("");
                    }}
                    aria-pressed={active}
                    className={`rounded-2xl border px-3 py-4 text-center transition-all ${
                      active
                        ? "border-primary bg-primary text-primary-foreground shadow-[var(--shadow-glow)]"
                        : "border-border bg-background text-foreground hover:border-primary/40"
                    }`}
                  >
                    <div className="font-serif-display text-xl leading-none sm:text-2xl">
                      ₹{amt.toLocaleString("en-IN")}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mx-auto mt-4 max-w-xl">
              <label
                htmlFor="custom-amount"
                className={`flex items-center gap-3 rounded-2xl border px-4 py-3 transition-all ${
                  selected === "custom"
                    ? "border-primary bg-primary/5 shadow-[var(--shadow-glow)]"
                    : "border-border bg-background hover:border-primary/40"
                }`}
              >
                <span className="font-serif-display text-xl text-muted-foreground">₹</span>
                <input
                  id="custom-amount"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  placeholder="Enter custom amount"
                  value={custom}
                  onChange={(e) => {
                    setCustom(e.target.value);
                    setSelected("custom");
                  }}
                  onFocus={() => setSelected("custom")}
                  className="w-full bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
                />
              </label>
            </div>

            <div className="mx-auto mt-4 grid max-w-xl gap-3 sm:grid-cols-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, 120))}
                placeholder="Your name (optional)"
                disabled={submitted}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value.slice(0, 254))}
                placeholder="Email (optional, to notify you)"
                disabled={submitted}
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
              />
            </div>
          </div>

          <div className="mx-auto mt-8 max-w-md">
            <button
              type="button"
              onClick={onSubmit}
              disabled={!validAmount || !validEmail || submitting || submitted}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-primary-foreground shadow-[var(--shadow-soft)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
              style={{ backgroundImage: "var(--gradient-emergency)" }}
            >
              {submitted ? (
                <>
                  <Check className="h-4 w-4" /> Thank you — we'll be in touch
                </>
              ) : submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Recording…
                </>
              ) : (
                <>
                  <Heart className="h-4 w-4" /> Pledge ₹{amount.toLocaleString("en-IN")}
                </>
              )}
            </button>

            {error ? (
              <p className="mt-3 text-center text-xs text-primary">{error}</p>
            ) : null}

            <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs leading-relaxed text-muted-foreground">
              <span>Secure donation portal launching soon. To donate now write to</span>
              <a
                href="mailto:contact@redstreamfoundation.org"
                className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
              >
                <Mail className="h-3 w-3" />
                contact@redstreamfoundation.org
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
