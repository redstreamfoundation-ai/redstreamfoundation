import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Inbox,
  Radio,
  Users,
  BarChart3,
  Settings,
  Bell,
  Search,
  ShieldCheck,
  Droplet,
} from "lucide-react";
import { useState, type ComponentType } from "react";

type NavItem = {
  to: string;
  label: string;
  icon: ComponentType<{ className?: string }>;
  badge?: string;
};

const NAV: NavItem[] = [
  { to: "/admin", label: "Overview", icon: LayoutDashboard },
  { to: "/admin/requests", label: "Request queue", icon: Inbox, badge: "12" },
  { to: "/admin/matching", label: "Live matching", icon: Radio, badge: "3" },
  { to: "/admin/donors", label: "Donor network", icon: Users },
  { to: "/admin/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin/settings", label: "Settings & safety", icon: Settings },
];

export function AdminShell() {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[oklch(0.97_0.005_25)] text-foreground">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-white/5 bg-[oklch(0.16_0.025_25)] text-white/90 transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2.5 px-5 pt-6 pb-7">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--gradient-emergency)] shadow-[var(--shadow-glow)]">
            <Droplet className="h-4 w-4 text-white" />
          </span>
          <div className="flex flex-col leading-tight">
            <span className="font-serif-display text-lg text-white">Redstream</span>
            <span className="text-[10px] font-medium uppercase tracking-[0.22em] text-white/50">
              Operations
            </span>
          </div>
        </div>

        <div className="mx-4 mb-4 rounded-xl border border-white/5 bg-white/5 px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75 animate-pulse-ring" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-[0.16em] text-white/70">
              All systems live
            </span>
          </div>
          <div className="mt-1 text-[11px] text-white/50">Delhi NCR · 42 zones</div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3">
          {NAV.map((item) => {
            const active =
              item.to === "/admin"
                ? path === "/admin"
                : path === item.to || path.startsWith(item.to + "/");
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={`mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                  active
                    ? "bg-white text-[oklch(0.16_0.025_25)] shadow-[var(--shadow-soft)]"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1">{item.label}</span>
                {item.badge ? (
                  <span
                    className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${
                      active
                        ? "bg-primary/10 text-primary"
                        : "bg-primary text-primary-foreground"
                    }`}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="mx-3 mb-4 rounded-xl border border-white/5 bg-white/5 p-3">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--gradient-emergency)] text-xs font-semibold text-white">
              PR
            </div>
            <div className="min-w-0 flex-1 leading-tight">
              <div className="truncate text-xs font-semibold text-white">
                Priya R.
              </div>
              <div className="text-[10px] text-white/50">Lead coordinator</div>
            </div>
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
          </div>
        </div>
      </aside>

      {/* Backdrop on mobile */}
      {open ? (
        <div
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
        />
      ) : null}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
          <div className="flex h-14 items-center gap-3 px-5">
            <button
              onClick={() => setOpen(true)}
              className="grid h-9 w-9 place-items-center rounded-lg border border-border lg:hidden"
              aria-label="Open menu"
            >
              <span className="flex flex-col gap-1">
                <span className="block h-0.5 w-4 rounded-full bg-foreground" />
                <span className="block h-0.5 w-4 rounded-full bg-foreground" />
              </span>
            </button>
            <div className="relative hidden flex-1 max-w-md md:block">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                placeholder="Search requests, donors, hospitals…"
                className="h-9 w-full rounded-lg border border-border bg-secondary/60 pl-9 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <div className="flex-1 md:hidden" />
            <button
              aria-label="Notifications"
              className="relative grid h-9 w-9 place-items-center rounded-lg border border-border"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />
            </button>
            <Link
              to="/"
              className="hidden rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-foreground hover:bg-secondary md:inline-flex"
            >
              View public site
            </Link>
          </div>
        </header>

        <main className="px-5 py-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow ? (
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-primary">
            {eyebrow}
          </div>
        ) : null}
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-foreground md:text-3xl">
          {title}
        </h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-border bg-card shadow-[var(--shadow-soft)] ${className}`}
    >
      {children}
    </div>
  );
}