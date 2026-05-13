import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

type Props = {
  icon?: React.ComponentType<{ className?: string }>;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
  emptyHint?: string;
};

export function Combobox({
  icon: Icon,
  label,
  placeholder,
  value,
  onChange,
  options,
  emptyHint = "Not listed — use what you typed",
}: Props) {
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(() => {
    const q = value.trim().toLowerCase();
    if (!q) return options.slice(0, 8);
    return options
      .filter((o) => o.toLowerCase().includes(q))
      .slice(0, 8);
  }, [value, options]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => setActiveIdx(0), [value]);

  const choose = (opt: string) => {
    onChange(opt);
    setOpen(false);
  };

  const onKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter" && filtered[activeIdx]) {
      e.preventDefault();
      choose(filtered[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  const matched = options.includes(value);

  return (
    <div ref={wrapRef} className="relative">
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </span>
      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        ) : (
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <input
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKey}
          placeholder={placeholder}
          autoComplete="off"
          maxLength={120}
          className="w-full rounded-2xl border border-border bg-card py-3.5 pl-11 pr-10 text-sm text-foreground shadow-[var(--shadow-soft)] outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle suggestions"
          className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
        >
          <ChevronDown className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`} />
        </button>
      </div>

      {open ? (
        <div className="absolute z-30 mt-2 max-h-72 w-full overflow-auto rounded-2xl border border-border bg-card p-1.5 shadow-[var(--shadow-elevated)]">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-xs text-muted-foreground">
              {emptyHint}
            </div>
          ) : (
            filtered.map((opt, i) => {
              const active = i === activeIdx;
              const selected = opt === value;
              return (
                <button
                  type="button"
                  key={opt}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(opt)}
                  onMouseEnter={() => setActiveIdx(i)}
                  className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors ${
                    active ? "bg-primary/10 text-foreground" : "text-foreground"
                  }`}
                >
                  <span className="truncate">{opt}</span>
                  {selected ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                  ) : null}
                </button>
              );
            })
          )}
          {value && !matched && filtered.length > 0 ? (
            <div className="border-t border-border/60 px-3 py-2 text-[11px] text-muted-foreground">
              Press Enter to use "{value}" as typed
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}