const STATS = [
  { value: "8,400+", label: "Active donors", hint: "Verified across NCR" },
  { value: "2,150", label: "Lives supported", hint: "Since 2022" },
  { value: "11 min", label: "Avg response time", hint: "Match to confirmation" },
  { value: "42", label: "Delhi coverage zones", hint: "From Dwarka to Noida" },
];

export function ImpactMetrics() {
  return (
    <section aria-label="Impact" className="px-5 py-12 md:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-5">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border bg-card p-5 shadow-[var(--shadow-soft)] transition-shadow hover:shadow-[var(--shadow-elevated)] md:p-6"
            >
              <div className="font-serif-display text-3xl text-foreground md:text-4xl">
                {s.value}
              </div>
              <div className="mt-2 text-sm font-medium text-foreground">{s.label}</div>
              <div className="mt-1 text-xs text-muted-foreground">{s.hint}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}