import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Logo } from "@/components/landing/Logo";

export const Route = createFileRoute("/reset-password")({
  component: ResetPasswordPage,
  head: () => ({
    meta: [
      { title: "Reset password — Redstream Foundation" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Supabase parses the recovery link automatically and emits a
    // PASSWORD_RECOVERY event. We just need a session to exist.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setError(error.message); return; }
    setDone(true);
    setTimeout(() => navigate({ to: "/auth", search: { redirect: "/donor/dashboard" }, replace: true }), 1800);
  };

  return (
    <div className="min-h-screen bg-background page-fade">
      <header className="border-b border-border/60">
        <div className="mx-auto flex max-w-md items-center justify-between px-5 py-4">
          <Logo />
          <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">Back home</Link>
        </div>
      </header>
      <main className="mx-auto max-w-md px-5 pt-10 pb-16">
        <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Reset password</div>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          Set a new <span className="font-serif-display italic text-primary">password</span>.
        </h1>

        {done ? (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-foreground">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>Password updated. Redirecting you to sign in…</span>
          </div>
        ) : !ready ? (
          <p className="mt-6 text-sm text-muted-foreground">
            Verifying your reset link…
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 space-y-3">
            <Input value={password} onChange={setPassword} placeholder="New password (min 6 chars)" />
            <Input value={confirm} onChange={setConfirm} placeholder="Confirm new password" />
            {error ? (
              <div className="flex items-start gap-2 rounded-xl border border-primary/30 bg-primary/5 p-3 text-xs text-foreground">
                <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <span>{error}</span>
              </div>
            ) : null}
            <button
              type="submit"
              disabled={busy || password.length < 6}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-glow)] transition-all hover:bg-[var(--primary-deep)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? "Saving…" : "Update password"} <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </main>
    </div>
  );
}

function Input({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <label className="block">
      <div className="relative">
        <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="password"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-4 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </label>
  );
}