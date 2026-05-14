import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

const URGENCY = ["urgent_2h", "same_day", "within_24h"] as const;

const InputSchema = z.object({
  patient_name: z.string().trim().min(2).max(120),
  blood_group: z.enum(BLOOD_GROUPS),
  units: z.number().int().min(1).max(20),
  hospital: z.string().trim().min(2).max(300),
  locality: z.string().trim().min(1).max(200),
  attendant_name: z.string().trim().min(2).max(120),
  attendant_phone: z.string().trim().min(7).max(20).regex(/^[+0-9 \-()]+$/),
  urgency: z.enum(URGENCY),
  requisition_url: z.string().trim().min(1).max(500),
});

// Map our chat-side urgency to the DB enum (request_urgency).
// The existing schema uses values like 'critical' | 'urgent' | 'standard'.
function mapUrgency(u: (typeof URGENCY)[number]): string {
  if (u === "urgent_2h") return "critical";
  if (u === "same_day") return "urgent";
  return "standard";
}

export const submitBloodRequestFromChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    const payload = {
      created_by: userId,
      patient_name: data.patient_name,
      blood_group: data.blood_group,
      component: "Whole Blood",
      units: data.units,
      hospital: data.hospital,
      locality: data.locality,
      attendant_name: data.attendant_name,
      attendant_phone: data.attendant_phone,
      urgency: mapUrgency(data.urgency),
      requisition_url: data.requisition_url,
      proof_uploaded: true,
      status: "pending",
      admin_status: "pending",
      source: "chatbot",
    };

    const { error } = await supabase.from("blood_requests").insert(payload);
    if (error) {
      console.error("submitBloodRequestFromChat error", error);
      throw new Error(error.message || "Could not save blood request.");
    }
    return { ok: true };
  });