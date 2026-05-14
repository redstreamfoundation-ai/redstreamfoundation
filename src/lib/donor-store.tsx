import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type DonorState = {
  fullName: string;
  phone: string;
  otp: string;
  otpVerified: boolean;
  bloodGroup: string;
  locality: string;
  pincode: string;
  profession: string;
  lastDonation: string;
  // Availability
  weekdays: boolean;
  weekends: boolean;
  slots: { morning: boolean; afternoon: boolean; evening: boolean; night: boolean };
  emergencyOnly: boolean;
  radiusKm: number;
  active: boolean;
  notifications: { push: boolean; sms: boolean; whatsapp: boolean; quietHours: boolean };
  lastDecision:
    | null
    | { kind: "accepted"; at: number }
    | { kind: "declined"; at: number }
    | { kind: "later"; at: number; inHours: number };
  activeRequestId: string | null;
};

const DEFAULT: DonorState = {
  fullName: "",
  phone: "",
  otp: "",
  otpVerified: false,
  bloodGroup: "",
  locality: "",
  pincode: "",
  profession: "",
  lastDonation: "",
  weekdays: true,
  weekends: true,
  slots: { morning: true, afternoon: true, evening: true, night: false },
  emergencyOnly: false,
  radiusKm: 8,
  active: true,
  notifications: { push: true, sms: true, whatsapp: false, quietHours: false },
  lastDecision: null,
  activeRequestId: null,
};

type Ctx = {
  state: DonorState;
  update: (patch: Partial<DonorState>) => void;
  toggleSlot: (k: keyof DonorState["slots"]) => void;
  reset: () => void;
};

const DonorCtx = createContext<Ctx | null>(null);

const STORAGE_KEY = "rs_donor_state_v1";

function loadInitial(): DonorState {
  if (typeof window === "undefined") return DEFAULT;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT;
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return DEFAULT;
  }
}

export function DonorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DonorState>(loadInitial);
  useEffect(() => {
    try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch {}
  }, [state]);
  const update = (patch: Partial<DonorState>) => setState((s) => ({ ...s, ...patch }));
  const toggleSlot = (k: keyof DonorState["slots"]) =>
    setState((s) => ({ ...s, slots: { ...s.slots, [k]: !s.slots[k] } }));
  const reset = () => {
    setState(DEFAULT);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  };
  return (
    <DonorCtx.Provider value={{ state, update, toggleSlot, reset }}>
      {children}
    </DonorCtx.Provider>
  );
}

export function useDonor() {
  const ctx = useContext(DonorCtx);
  if (!ctx) throw new Error("useDonor must be used inside DonorProvider");
  return ctx;
}