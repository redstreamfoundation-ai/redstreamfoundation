import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-",
] as const;

const InputSchema = z.object({
  full_name: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(7).max(20).regex(/^[+0-9 \-()]+$/),
  blood_group: z.enum(BLOOD_GROUPS),
  age: z.number().int().min(18).max(65),
  locality: z.string().trim().min(2).max(200),
  last_donation_date: z.string().trim().max(20).nullable().optional(),
  availability: z.string().trim().min(2).max(60),
  id_proof_url: z.string().trim().min(1).max(500),
});

export const registerDonorFromChat = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabase, userId } = context as {
      supabase: import("@supabase/supabase-js").SupabaseClient;
      userId: string;
    };

    let lastDonation: string | null = null;
    if (data.last_donation_date) {
      const d = new Date(data.last_donation_date);
      if (!Number.isNaN(d.getTime())) {
        lastDonation = d.toISOString().slice(0, 10);
      }
    }

    const payload = {
      user_id: userId,
      full_name: data.full_name,
      phone: data.phone,
      blood_group: data.blood_group,
      age: data.age,
      locality: data.locality,
      pincode: "",
      availability: data.availability,
      last_donation_date: lastDonation,
      id_proof_url: data.id_proof_url,
      status: "pending",
      source: "chatbot",
    };

    const { data: existing, error: selErr } = await supabase
      .from("donors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (selErr) {
      console.error("registerDonorFromChat select error", selErr);
      throw new Error(selErr.message || "Could not check existing donor.");
    }

    const op = existing
      ? supabase.from("donors").update(payload).eq("user_id", userId)
      : supabase.from("donors").insert(payload);
    const { error } = await op;
    if (error) {
      console.error("registerDonorFromChat write error", error);
      throw new Error(error.message || "Could not save donor registration.");
    }

    return { ok: true };
  });