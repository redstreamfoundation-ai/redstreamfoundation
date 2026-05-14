import { action } from "./api-client";

export const registerDonorFromChat = action<
  {
    full_name: string;
    phone: string;
    blood_group: string;
    age: number;
    locality: string;
    last_donation_date?: string | null;
    availability: string;
    id_proof_url: string;
  },
  { ok: true }
>("registerDonorFromChat");