import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

async function assertAdminRole(userId: string) {
  const { data, error } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

async function actorEmail(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email ?? userId;
}

export const adminListDonors = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminRole(context.userId);
    const { data: donors, error } = await supabaseAdmin
      .from("donors")
      .select("id, full_name, phone, blood_group, locality, pincode, status, verified, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { donors: donors ?? [] };
  });

export const adminListRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminRole(context.userId);
    const { data: requests, error } = await supabaseAdmin
      .from("blood_requests")
      .select("id, attendant_name, attendant_phone, blood_group, hospital, locality, units, urgency, component, patient_age, status, admin_status, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return { requests: requests ?? [] };
  });

export const adminUpdateDonorStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "rejected" | "pending" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: existing } = await supabaseAdmin
      .from("donors").select("full_name").eq("id", data.id).single();
    const { error } = await supabaseAdmin
      .from("donors")
      .update({ status: data.status, verified: data.status === "approved" })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_audit_log").insert({
      action: data.status,
      target_type: "donor",
      target_id: data.id,
      target_label: existing?.full_name ?? null,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

export const adminUpdateRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "rejected" | "pending" }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: existing } = await supabaseAdmin
      .from("blood_requests")
      .select("attendant_name, hospital, blood_group")
      .eq("id", data.id).single();
    const { error } = await supabaseAdmin
      .from("blood_requests")
      .update({ admin_status: data.status })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    const label = existing
      ? `${existing.attendant_name} · ${existing.blood_group} · ${existing.hospital}`
      : null;
    await supabaseAdmin.from("admin_audit_log").insert({
      action: data.status,
      target_type: "request",
      target_id: data.id,
      target_label: label,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

const COMPAT: Record<string, string[]> = {
  "O-": ["O-"],
  "O+": ["O+", "O-"],
  "A-": ["A-", "O-"],
  "A+": ["A+", "A-", "O+", "O-"],
  "B-": ["B-", "O-"],
  "B+": ["B+", "B-", "O+", "O-"],
  "AB-": ["AB-", "A-", "B-", "O-"],
  "AB+": ["AB+", "AB-", "A+", "A-", "B+", "B-", "O+", "O-"],
};

export const adminGetRequestDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: req, error } = await supabaseAdmin
      .from("blood_requests").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);

    const groups = COMPAT[req.blood_group] ?? [req.blood_group];
    const { data: donors, error: dErr } = await supabaseAdmin
      .from("donors")
      .select("id, full_name, phone, blood_group, locality, pincode, status")
      .eq("status", "approved")
      .in("blood_group", groups);
    if (dErr) throw new Error(dErr.message);

    const target = (req.locality || req.hospital || "").toLowerCase();
    const sorted = [...(donors ?? [])].sort((a, b) => {
      const al = (a.locality || "").toLowerCase();
      const bl = (b.locality || "").toLowerCase();
      const aMatch = target && al && (target.includes(al) || al.includes(target)) ? 0 : 1;
      const bMatch = target && bl && (target.includes(bl) || bl.includes(target)) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return al.localeCompare(bl);
    });

    return { request: req, matches: sorted };
  });

export const adminGetStats = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminRole(context.userId);
    const [totalDonors, pendingDonors, approvedDonors, totalRequests, pendingRequests] = await Promise.all([
      supabaseAdmin.from("donors").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("donors").select("id", { count: "exact", head: true }).eq("status", "pending"),
      supabaseAdmin.from("donors").select("id", { count: "exact", head: true }).eq("status", "approved"),
      supabaseAdmin.from("blood_requests").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("blood_requests").select("id", { count: "exact", head: true }).eq("admin_status", "pending"),
    ]);
    return {
      totalDonors: totalDonors.count ?? 0,
      pendingDonors: pendingDonors.count ?? 0,
      approvedDonors: approvedDonors.count ?? 0,
      totalRequests: totalRequests.count ?? 0,
      pendingRequests: pendingRequests.count ?? 0,
    };
  });

export const adminListAudit = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { limit?: number }) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const limit = Math.min(Math.max(data?.limit ?? 500, 1), 2000);
    const { data: rows, error } = await supabaseAdmin
      .from("admin_audit_log")
      .select("id, action, target_type, target_id, target_label, actor, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { entries: rows ?? [] };
  });
