export function LiveBadge({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-1.5 text-xs font-medium text-foreground/80 shadow-[var(--shadow-soft)] backdrop-blur">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-70 animate-pulse-ring" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-primary animate-pulse-dot" />
      </span>
      <span>{label}</span>
    </div>
  );
}