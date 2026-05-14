// Browser-side wrappers around the consolidated `api` edge function.
// Call signatures mirror the previous createServerFn API so existing
// call sites (`fn({ data: payload })`) continue to work unchanged.
import { action } from "./api-client";

export const adminListDonors = action<
  { source?: "form" | "chatbot" | "all" } | undefined,
  { donors: Array<Record<string, unknown>> }
>("adminListDonors");

export const adminListRequests = action<
  { source?: "form" | "chatbot" | "all" } | undefined,
  { requests: Array<Record<string, unknown>> }
>("adminListRequests");

export const adminUpdateDonorStatus = action<
  { id: string; status: "approved" | "rejected" | "pending" },
  { ok: true }
>("adminUpdateDonorStatus");

export const adminUpdateDonor = action<
  {
    id: string;
    full_name: string;
    phone: string;
    blood_group: string;
    locality: string;
    pincode?: string;
    last_donation_date: string | null;
  },
  { ok: true }
>("adminUpdateDonor");

export const adminDeleteDonor = action<{ id: string }, { ok: true }>("adminDeleteDonor");

export const adminUpdateRequestStatus = action<
  { id: string; status: "approved" | "rejected" | "pending" | "fulfilled" },
  { ok: true }
>("adminUpdateRequestStatus");

export const adminUpdateRequest = action<
  {
    id: string;
    attendant_name: string;
    attendant_phone: string;
    blood_group: string;
    hospital: string;
    locality: string;
    units: number;
    component: string;
    urgency: string;
    patient_age: string | null;
  },
  { ok: true }
>("adminUpdateRequest");

export const adminDeleteRequest = action<{ id: string }, { ok: true }>("adminDeleteRequest");

export const adminGetSignedDocumentUrl = action<
  { bucket: "donor-id-proofs" | "blood-requisitions"; path: string },
  { url: string }
>("adminGetSignedDocumentUrl");

export const adminGetRequestDetail = action<
  { id: string },
  { request: Record<string, unknown>; matches: Array<Record<string, unknown>> }
>("adminGetRequestDetail");

export const adminGetStats = action<
  undefined,
  {
    totalDonors: number;
    pendingDonors: number;
    approvedDonors: number;
    totalRequests: number;
    pendingRequests: number;
  }
>("adminGetStats");

export const adminListAudit = action<
  { limit?: number } | undefined,
  { entries: Array<Record<string, unknown>> }
>("adminListAudit");

export const adminGetSettings = action<undefined, { settings: Record<string, unknown> }>(
  "adminGetSettings",
);

export const adminUpdateSettings = action<
  {
    notify_push: boolean;
    notify_sms: boolean;
    notify_whatsapp: boolean;
    notify_email_digest: boolean;
    default_radius_km: number;
    max_radius_km: number;
    auto_expand: boolean;
    mask_contacts: boolean;
    hide_exact_location: boolean;
    requisition_retention_days: number;
  },
  { settings: Record<string, unknown> }
>("adminUpdateSettings");