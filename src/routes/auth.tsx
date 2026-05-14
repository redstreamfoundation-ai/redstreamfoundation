import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { useAuth } from "@/lib/auth-context";
import { Logo } from "@/components/landing/Logo";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
  validateSearch: (s: Record<string, unknown>) => ({
    redirect: typeof s.redirect === "string" ? s.redirect : "/donor/dashboard",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — Redstream Foundation" },
      { name: "description", content: "Sign in or create your Redstream account to coordinate emergency blood donations." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Decide intended role from where the user came from.
  const intendedRole: "donor" | "patient" = redirect.startsWith("/request") ? "patient" : "donor";

  useEffect(() => {
    if (!loading && session) {
      // Reconcile role for OAuth (Google) sign-ins, which don't carry metadata.
      const stashed =
        (typeof window !== "undefined" && window.localStorage.getItem("rs_intended_role")) || intendedRole;
      supabase.rpc("ensure_my_role", { _intended: stashed }).then(() => {
        try { window.localStorage.removeItem("rs_intended_role"); } catch {}
        navigate({ to: redirect, replace: true });
      });
    }
  }, [session, loading, navigate, redirect, intendedRole]);

  // Wait until handle_new_user trigger has written a row in user_roles
  // before forwarding to the registration / request form.
  const waitForRole = async (userId: string) => {
    for (let i = 0; i < 10; i++) {
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();
      if (data?.role) return data.role;
      await new Promise((r) => setTimeout(r, 300));
    }
    return null;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (mode === "forgot") {
      if (!email) { setError("Enter the email associated with your account."); return; }
      setBusy(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      setBusy(false);
      if (error) { setError(error.message); return; }
      setInfo("Check your inbox for a password reset link.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName, intended_role: intendedRole },
            emailRedirectTo: window.location.origin + redirect,
          },
        });
        if (error) throw error;
        let userId = data.user?.id ?? null;
        if (!data.session) {
          // Fallback: sign in immediately (auto-confirm is enabled, but be safe)
          const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
          if (signInErr) throw signInErr;
          userId = signInData.user?.id ?? userId;
        }
        // Validate that the trigger wrote the correct role before redirecting.
        if (userId) await waitForRole(userId);
        navigate({ to: redirect, replace: true });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: redirect, replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    setError(null);
    setBusy(true);
    try { window.localStorage.setItem("rs_intended_role", intendedRole); } catch {}
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/auth?redirect=${encodeURIComponent(redirect)}`,
    });
    if (result.error) {
      setError(result.error.message ?? "Google sign-in failed");
      setBusy(false);
      return;
    }
    if (result.redirected) return;
    navigate({ to: redirect, replace: true });
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
          {mode === "signup" ? "Create account" : mode === "forgot" ? "Reset password" : "Welcome back"}
        </div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {mode === "signup" ? (
            <>Join the <span className="font-serif-display italic text-primary">donor</span> network.</>
          ) : mode === "forgot" ? (
            <>Forgot your <span className="font-serif-display italic text-primary">password</span>?</>
          ) : (
            <>Sign in to <span className="font-serif-display italic text-primary">Redstream</span>.</>
          )}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {mode === "signup"
            ? "One account to request blood or respond to emergencies."
            : mode === "forgot"
            ? "Enter your email and we'll send you a secure link to set a new password."
            : "Welcome back. Pick up where you left off."}
        </p>

        {mode !== "forgot" ? (
        <>
        <button
          onClick={google}
          disabled={busy}
          className="mt-6 inline-flex w-full items-center justify-center gap-3 rounded-2xl border border-border bg-card px-5 py-3.5 text-sm font-semibold text-foreground shadow-[var(--shadow-soft)] transition-all hover:border-primary/40 disabled:opacity-50"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden>
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.5-2.2 3.3v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.3z"/>
            <path fill="#34A853" d="M12 23c2.9 0 5.4-1 7.2-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.6 1.1-2.8 0-5.1-1.9-6-4.4H2.3v2.8C4.1 20.5 7.8 23 12 23z"/>
            <path fill="#FBBC05" d="M6 14.2c-.2-.7-.4-1.4-.4-2.2s.1-1.5.4-2.2V7H2.3C1.5 8.6 1 10.3 1 12s.5 3.4 1.3 5l3.7-2.8z"/>
            <path fill="#EA4335" d="M12 5.4c1.6 0 3 .5 4.1 1.6l3.1-3.1C17.4 2.1 14.9 1 12 1 7.8 1 4.1 3.5 2.3 7l3.7 2.8c.9-2.5 3.2-4.4 6-4.4z"/>
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or email <span className="h-px flex-1 bg-border" />
        </div>
        </>
        ) : <div className="h-6" />}

        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" ? (
            <Field icon={UserIcon} placeholder="Full name" value={fullName} onChange={setFullName} />
          ) : null}
          <Field icon={Mail} type="email" placeholder="Email address" value={email} onChange={setEmail} />
          {mode !== "forgot" ? (
            <Field icon={Lock} type="password" placeholder="Password (min 6 chars)" value={password} onChange={setPassword} />
          ) : null}

          {mode === "signin" ? (
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => { setError(null); setInfo(null); setMode("forgot"); }}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
              >
                <KeyRound className="h-3 w-3" /> Forgot password?
              </button>
            </div>
          ) : null}

          {error ? (
            <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>{error}</span>
            </div>
          ) : null}
          {info ? (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 text-xs text-foreground">
              {info}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={
              busy ||
              !email ||
              (mode !== "forgot" && password.length < 6) ||
              (mode === "signup" && !fullName.trim())
            }
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy
              ? "Please wait…"
              : mode === "signup"
              ? "Create account"
              : mode === "forgot"
              ? "Send reset link"
              : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "forgot" ? (
            <button
              onClick={() => { setError(null); setInfo(null); setMode("signin"); }}
              className="font-semibold text-primary hover:underline"
            >
              Back to sign in
            </button>
          ) : (
            <>
              {mode === "signup" ? "Already have an account? " : "New to Redstream? "}
              <button
                onClick={() => { setError(null); setInfo(null); setMode(mode === "signup" ? "signin" : "signup"); }}
                className="font-semibold text-primary hover:underline"
              >
                {mode === "signup" ? "Sign in" : "Create one"}
              </button>
            </>
          )}
        </p>
      </main>
    </div>
  );
}

function Field({
  icon: Icon, type = "text", placeholder, value, onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="block">
      <div className="relative">
        <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}
