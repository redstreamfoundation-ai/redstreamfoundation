import { useEffect, useState } from "react";
import { Check, MapPin, Radio, Droplet, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Event = {
  id: string;
  kind: "matched" | "request" | "fulfilled";
  group: string;
  zone: string;
  at: number;
};

const META: Record<Event["kind"], { label: string; icon: typeof Check; tone: string }> = {
  request: { label: "New emergency request", icon: Droplet, tone: "text-primary bg-primary/10" },
  matched: { label: "Donor matched", icon: Radio, tone: "text-primary bg-primary/10" },
  fulfilled: { label: "Request fulfilled", icon: Check, tone: "text-emerald-600 bg-emerald-500/10" },
};

const FALLBACK: Event[] = [
  { id: "s1", kind: "matched", group: "B+", zone: "Saket", at: Date.now() - 60_000 },
  { id: "s2", kind: "request", group: "O-", zone: "Karol Bagh", at: Date.now() - 2 * 60_000 },
  { id: "s3", kind: "fulfilled", group: "A+", zone: "Dwarka", at: Date.now() - 5 * 60_000 },
  { id: "s4", kind: "matched", group: "AB+", zone: "Noida 62", at: Date.now() - 8 * 60_000 },
  { id: "s5", kind: "fulfilled", group: "O+", zone: "Lajpat Nagar", at: Date.now() - 12 * 60_000 },
];

function ago(ms: number): string {
  const s = Math.floor((Date.now() - ms) / 1000);
  if (s < 30) return "just now";
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  return `${Math.floor(m / 60)}h`;
}

export function LiveActivityFeed() {
  const [events, setEvents] = useState<Event[]>(FALLBACK);
  const [pulse, setPulse] = useState(0);

  const pushEvent = (ev: Event) => {
    setEvents((prev) => {
      const filtered = prev.filter((p) => p.id !== ev.id);
      return [ev, ...filtered].slice(0, 8);
    });
    setPulse((p) => p + 1);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [{ data: reqs }, { data: matches }] = await Promise.all([
        supabase
          .from("blood_requests")
          .select("id, blood_group, locality, status, created_at")
          .order("created_at", { ascending: false })
          .limit(8),
        supabase
          .from("request_matches")
          .select("id, decision, created_at, request:blood_requests(blood_group, locality)")
          .eq("decision", "accepted")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);
      if (cancelled) return;
      const merged: Event[] = [];
      for (const r of reqs ?? []) {
        merged.push({
          id: `r-${r.id}`,
          kind: r.status === "fulfilled" ? "fulfilled" : "request",
          group: r.blood_group,
          zone: r.locality,
          at: new Date(r.created_at).getTime(),
        });
      }
      for (const m of matches ?? []) {
        const req = (m as { request: { blood_group: string; locality: string } | null }).request;
        if (!req) continue;
        merged.push({
          id: `m-${m.id}`,
          kind: "matched",
          group: req.blood_group,
          zone: req.locality,
          at: new Date(m.created_at).getTime(),
        });
      }
      merged.sort((a, b) => b.at - a.at);
      if (merged.length) setEvents(merged.slice(0, 8));
    })();

    const channel = supabase
      .channel("live-feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "blood_requests" },
        (payload) => {
          const r = payload.new as { id: string; blood_group: string; locality: string };
          setEvents((prev) =>
            [
              { id: `r-${r.id}`, kind: "request" as const, group: r.blood_group, zone: r.locality, at: Date.now() },
              ...prev,
            ].slice(0, 6),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "blood_requests" },
        (payload) => {
          const r = payload.new as { id: string; blood_group: string; locality: string; status: string };
          if (r.status !== "fulfilled") return;
          setEvents((prev) =>
            [
              { id: `f-${r.id}-${Date.now()}`, kind: "fulfilled" as const, group: r.blood_group, zone: r.locality, at: Date.now() },
              ...prev,
            ].slice(0, 6),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "request_matches" },
        async (payload) => {
          const m = payload.new as { id: string; request_id: string; decision: string };
          if (m.decision !== "accepted") return;
          const { data: req } = await supabase
            .from("blood_requests")
            .select("blood_group, locality")
            .eq("id", m.request_id)
            .maybeSingle();
          if (!req) return;
          pushEvent({
            id: `m-${m.id}`,
            kind: "matched",
            group: req.blood_group,
            zone: req.locality,
            at: Date.now(),
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "request_matches" },
        async (payload) => {
          const m = payload.new as { id: string; request_id: string; decision: string };
          if (m.decision !== "accepted") return;
          const { data: req } = await supabase
            .from("blood_requests")
            .select("blood_group, locality")
            .eq("id", m.request_id)
            .maybeSingle();
          if (!req) return;
          pushEvent({
            id: `m-${m.id}`,
            kind: "matched",
            group: req.blood_group,
            zone: req.locality,
            at: Date.now(),
          });
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <section aria-label="Live activity" className="bg-secondary/60 px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="mb-10 grid items-end gap-6 md:mb-14 md:grid-cols-12">
          <div className="md:col-span-8">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Live across Delhi
            </span>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-foreground md:text-5xl">
              Real coordination, in real time.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
              New emergency requests, donor matches and fulfilled cases stream in
              from our coordination database the moment they happen.
            </p>
          </div>
          <div className="flex items-center gap-3 md:col-span-4 md:justify-end">
            <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-pulse-ring" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
              </span>
              Live feed
            </span>
            <span
              key={pulse}
              className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary animate-slide-up"
            >
              <Activity className="h-3 w-3" />
              {events.length} recent events
            </span>
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-[var(--shadow-elevated)]">
          <ul className="grid divide-y divide-border lg:grid-cols-2 lg:divide-y-0 lg:divide-x">
            {events.map((e) => {
              const m = META[e.kind];
              const Icon = m.icon;
              return (
                <li
                  key={e.id}
                  className="flex items-center gap-4 px-5 py-4 animate-slide-up lg:[&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-border"
                >
                  <span className={`grid h-10 w-10 place-items-center rounded-xl ${m.tone}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{m.label}</span>
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                        {e.group}
                      </span>
                    </div>
                    <div className="mt-0.5 truncate text-xs text-muted-foreground">
                      <MapPin className="mr-1 inline h-3 w-3" />
                      {e.zone}, Delhi NCR
                    </div>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">{ago(e.at)}</span>
                </li>
              );
            })}
          </ul>
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Updates stream from the live coordination database via Supabase Realtime.
        </p>
      </div>
    </section>
  );
}
