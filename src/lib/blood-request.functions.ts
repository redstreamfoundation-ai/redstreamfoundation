import { action } from "./api-client";

export const submitBloodRequestFromChat = action<
  {
    patient_name: string;
    blood_group: string;
    units: number;
    hospital: string;
    locality: string;
    attendant_name: string;
    attendant_phone: string;
    urgency: "urgent_2h" | "same_day" | "within_24h";
    requisition_url: string;
  },
  { ok: true }
>("submitBloodRequestFromChat");