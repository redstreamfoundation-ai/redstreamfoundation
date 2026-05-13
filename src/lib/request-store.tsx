import { createContext, useContext, useState, type ReactNode } from "react";

export type Urgency = "critical" | "within-2h" | "within-24h" | "planned";

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

export function RequestProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RequestState>(DEFAULT);
  const update = (patch: Partial<RequestState>) =>
    setState((s) => ({ ...s, ...patch }));
  const reset = () => setState(DEFAULT);
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