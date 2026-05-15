import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Phone, KeyRound, ArrowRight, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/landing/Logo";
import { invokeAction } from "@/lib/api-client";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/donor/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Redstream Foundation" },
      {
        name: "description",
        content:
          "Sign in to Redstream with your mobile number and OTP to coordinate emergency blood donations.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { session, loading } = useAuth();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const navigatedRef = useRef(false);

  const intendedRole: "donor" | "patient" =
    redirect.startsWith("/request") ? "patient" : "donor";

  useEffect(() => {
    if (!loading && session && !navigatedRef.current) {
      navigatedRef.current = true;
      void supabase
        .rpc("ensure_my_role", { _intended: intendedRole })
        .then(() => navigate({ to: redirect, replace: true }));
    }
  }, [session, loading, navigate, redirect, intendedRole]);

  const sendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    const trimmed = phone.replace(/\D+/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(trimmed)) {
      setError("Enter a valid 10-digit Indian mobile number.");
      return;
    }
    setBusy(true);
    try {
      const r = await invokeAction<{ verificationId: string }>("sendPhoneOtp", {
        phone: trimmed,
      });
      setPhone(trimmed);
      setVerificationId(r.verificationId);
      setStep("otp");
      setInfo(`OTP sent to +91 ${trimmed}.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send OTP");
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!/^\d{4,6}$/.test(code)) {
      setError("Enter the OTP from your SMS.");
      return;
    }
    if (!verificationId) {
      setError("Please request a new OTP.");
      return;
    }
    setBusy(true);
    try {
      const tokens = await invokeAction<{
        access_token: string;
        refresh_token: string;
      }>("verifyPhoneOtp", { phone, verificationId, code, intendedRole });
      const { error } = await supabase.auth.setSession({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      });
      if (error) throw error;
      // useEffect will reconcile role and navigate.
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const resend = async () => {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const r = await invokeAction<{ verificationId: string }>("sendPhoneOtp", {
        phone,
      });
      setVerificationId(r.verificationId);
      setInfo("A new OTP has been sent.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not resend OTP");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background page-fade">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Logo />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">
            Back home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-5 pt-10 pb-16">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
          {step === "phone" ? "Sign in with mobile" : "Verify OTP"}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {step === "phone" ? (
            <>
              Continue with your{" "}
              <span className="font-serif-display italic text-primary">mobile</span>.
            </>
          ) : (
            <>
              Enter the{" "}
              <span className="font-serif-display italic text-primary">6-digit</span>{" "}
              code.
            </>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {step === "phone"
            ? "We'll text you a one-time password. Indian mobile numbers only."
            : `Sent to +91 ${phone}. The code expires in a few minutes.`}
        </p>

        <div className="mt-8">
          {step === "phone" ? (
            <form onSubmit={sendOtp} className="space-y-3">
              <label className="block">
                <div className="flex items-stretch">
                  <span className="inline-flex items-center gap-2 rounded-l-2xl border border-r-0 border-border bg-card px-4 text-sm font-medium text-foreground">
                    <Phone className="h-4 w-4 text-primary" /> +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel-national"
                    maxLength={10}
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value.replace(/\D+/g, "").slice(0, 10))
                    }
                    placeholder="10-digit mobile number"
                    className="w-full rounded-r-2xl border border-border bg-card py-3.5 pl-3 pr-4 text-sm tracking-wider text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
              {error ? <Alert kind="error">{error}</Alert> : null}
              {info ? <Alert kind="info">{info}</Alert> : null}
              <button
                type="submit"
                disabled={busy || phone.length !== 10}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Sending OTP…" : "Send OTP"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <p className="pt-2 text-center text-xs text-muted-foreground">
                By continuing, you agree to receive a one-time SMS for verification.
              </p>
            </form>
          ) : (
            <form onSubmit={verify} className="space-y-3">
              <label className="block">
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) =>
                      setCode(e.target.value.replace(/\D+/g, "").slice(0, 6))
                    }
                    placeholder="6-digit OTP"
                    className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-center text-base tracking-[0.5em] text-foreground shadow-[var(--shadow-soft)] outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              </label>
              {error ? <Alert kind="error">{error}</Alert> : null}
              {info ? <Alert kind="info">{info}</Alert> : null}
              <button
                type="submit"
                disabled={busy || code.length < 4}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busy ? "Verifying…" : "Verify & continue"}
                <ArrowRight className="h-4 w-4" />
              </button>
              <div className="flex items-center justify-between pt-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setVerificationId(null);
                    setError(null);
                    setInfo(null);
                  }}
                  className="font-medium text-muted-foreground hover:text-foreground"
                >
                  ← Change number
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={resend}
                  className="font-semibold text-primary hover:underline disabled:opacity-50"
                >
                  Resend OTP
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}

function Alert({
  kind,
  children,
}: {
  kind: "error" | "info";
  children: React.ReactNode;
}) {
  if (kind === "error") {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
        <span>{children}</span>
      </div>
    );
  }
  return (
    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground">
      {children}
    </div>
  );
}
