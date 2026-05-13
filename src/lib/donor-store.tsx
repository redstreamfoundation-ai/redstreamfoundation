import { createContext, useContext, useState, type ReactNode } from "react";

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
};

type Ctx = {
  state: DonorState;
  update: (patch: Partial<DonorState>) => void;
  toggleSlot: (k: keyof DonorState["slots"]) => void;
  reset: () => void;
};

const DonorCtx = createContext<Ctx | null>(null);

export function DonorProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DonorState>(DEFAULT);
  const update = (patch: Partial<DonorState>) => setState((s) => ({ ...s, ...patch }));
  const toggleSlot = (k: keyof DonorState["slots"]) =>
    setState((s) => ({ ...s, slots: { ...s.slots, [k]: !s.slots[k] } }));
  const reset = () => setState(DEFAULT);
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