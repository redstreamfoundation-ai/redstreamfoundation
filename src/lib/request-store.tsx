import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Urgency = "critical" | "within-2h" | "within-24h" | "planned";

export type RequestMode = {
  id: "critical" | "urgent" | "scheduled";
  label: string;
  window: string;
  tone: "critical" | "urgent" | "calm";
  description: string;
};

export const REQUEST_MODES: RequestMode[] = [
  {
    id: "critical",
    label: "Critical emergency",
    window: "Within 1–2 hours",
    tone: "critical",
    description:
      "Aggressive matching, live coordination, expanding donor radius and emergency escalation.",
  },
  {
    id: "urgent",
    label: "Same-day urgent",
    window: "Within 24 hours",
    tone: "urgent",
    description:
      "Active donor outreach with scheduled confirmations and moderate urgency notifications.",
  },
  {
    id: "scheduled",
    label: "Scheduled requirement",
    window: "1–3 days ahead",
    tone: "calm",
    description:
      "Planned coordination — donors are matched and confirmed in advance for surgeries or recurring needs.",
  },
];

export function modeForUrgency(u: Urgency | ""): RequestMode {
  if (u === "critical" || u === "within-2h") return REQUEST_MODES[0];
  if (u === "within-24h") return REQUEST_MODES[1];
  return REQUEST_MODES[2];
}

export type RequestState = {
  bloodGroup: string;
  component: string;
  units: number;
  urgency: Urgency | "";
  hospital: string;
  locality: string;
  patientAge: string;
  attendantName: string;
  attendantPhone: string;
  proofUploaded: boolean;
  requestId: string | null;
};

const DEFAULT: RequestState = {
  bloodGroup: "",
  component: "Whole Blood",
  units: 1,
  urgency: "",
  hospital: "",
  locality: "",
  patientAge: "",
  attendantName: "",
  attendantPhone: "",
  proofUploaded: false,
  requestId: null,
};

type Ctx = {
  state: RequestState;
  update: (patch: Partial<RequestState>) => void;
  reset: () => void;
};

const RequestCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "rs_request_state_v1";

function loadInitial(): RequestState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function RequestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RequestState>(loadInitial);
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);
  const update = (patch: Partial<RequestState>) =>
    setState((s) => ({ ...s, ...patch }));
  const reset = () => {
    setState(DEFAULT);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  };
  return (
    <RequestCtx.Provider value={{ state, update, reset }}>
      {children}
    </RequestCtx.Provider>
  );
}

export function useRequest() {
  const ctx = useContext(RequestCtx);
  if (!ctx) throw new Error("useRequest must be used inside RequestProvider");
  return ctx;
}