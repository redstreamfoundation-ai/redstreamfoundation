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
  .inputValidator((d: { source?: "form" | "chatbot" | "all" } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    let q = supabaseAdmin
      .from("donors")
      .select("id, full_name, phone, blood_group, locality, pincode, status, verified, created_at, last_donation_date, age, availability, id_proof_url, source")
      .order("created_at", { ascending: false });
    if (data?.source && data.source !== "all") q = q.eq("source", data.source);
    const { data: donors, error } = await q;
    if (error) throw new Error(error.message);
    return { donors: donors ?? [] };
  });

export const adminListRequests = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { source?: "form" | "chatbot" | "all" } | undefined) => d ?? {})
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    let q = supabaseAdmin
      .from("blood_requests")
      .select("id, attendant_name, attendant_phone, blood_group, hospital, locality, units, urgency, component, patient_age, status, admin_status, created_at, patient_name, requisition_url, source")
      .order("created_at", { ascending: false });
    if (data?.source && data.source !== "all") q = q.eq("source", data.source);
    const { data: requests, error } = await q;
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

export const adminUpdateDonor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
    id: string;
    full_name: string;
    phone: string;
    blood_group: string;
    locality: string;
    pincode?: string;
    last_donation_date: string | null;
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { error } = await supabaseAdmin
      .from("donors")
      .update({
        full_name: data.full_name,
        phone: data.phone,
        blood_group: data.blood_group,
        locality: data.locality,
        pincode: data.pincode ?? "",
        last_donation_date: data.last_donation_date,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_audit_log").insert({
      action: "edit",
      target_type: "donor",
      target_id: data.id,
      target_label: data.full_name,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

export const adminDeleteDonor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: existing } = await supabaseAdmin
      .from("donors").select("full_name").eq("id", data.id).single();
    const { error } = await supabaseAdmin.from("donors").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_audit_log").insert({
      action: "delete",
      target_type: "donor",
      target_id: data.id,
      target_label: existing?.full_name ?? null,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

export const adminUpdateRequestStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string; status: "approved" | "rejected" | "pending" | "fulfilled" }) => d)
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

export const adminUpdateRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
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
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { error } = await supabaseAdmin
      .from("blood_requests")
      .update({
        attendant_name: data.attendant_name,
        attendant_phone: data.attendant_phone,
        blood_group: data.blood_group,
        hospital: data.hospital,
        locality: data.locality,
        units: data.units,
        component: data.component,
        urgency: data.urgency as "critical" | "planned" | "within-24h" | "within-2h",
        patient_age: data.patient_age,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_audit_log").insert({
      action: "edit",
      target_type: "request",
      target_id: data.id,
      target_label: `${data.attendant_name} · ${data.blood_group} · ${data.hospital}`,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

export const adminDeleteRequest = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: existing } = await supabaseAdmin
      .from("blood_requests")
      .select("attendant_name, hospital, blood_group")
      .eq("id", data.id)
      .maybeSingle();
    const { error } = await supabaseAdmin.from("blood_requests").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    const label = existing
      ? `${existing.attendant_name} · ${existing.blood_group} · ${existing.hospital}`
      : null;
    await supabaseAdmin.from("admin_audit_log").insert({
      action: "delete",
      target_type: "request",
      target_id: data.id,
      target_label: label,
      actor: await actorEmail(context.userId),
    });
    return { ok: true };
  });

export const adminGetSignedDocumentUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { bucket: "donor-id-proofs" | "blood-requisitions"; path: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: signed, error } = await supabaseAdmin.storage
      .from(data.bucket)
      .createSignedUrl(data.path, 60 * 10); // 10 minutes
    if (error) throw new Error(error.message);
    return { url: signed.signedUrl };
  });

export const adminGetRequestDetail = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: { id: string }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const { data: req, error } = await supabaseAdmin
      .from("blood_requests").select("*").eq("id", data.id).single();
    if (error) throw new Error(error.message);

    const { data: donors, error: dErr } = await supabaseAdmin
      .from("donors")
      .select("id, full_name, phone, blood_group, locality, pincode, status, last_donation_date")
      .eq("status", "approved")
      .eq("blood_group", req.blood_group);
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

export const adminGetSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdminRole(context.userId);
    const { data, error } = await supabaseAdmin
      .from("app_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      const { data: created, error: insErr } = await supabaseAdmin
        .from("app_settings")
        .insert({ singleton: true })
        .select("*")
        .single();
      if (insErr) throw new Error(insErr.message);
      return { settings: created };
    }
    return { settings: data };
  });

export const adminUpdateSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: {
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
  }) => d)
  .handler(async ({ data, context }) => {
    await assertAdminRole(context.userId);
    const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, Math.round(n)));
    const payload = {
      notify_push: !!data.notify_push,
      notify_sms: !!data.notify_sms,
      notify_whatsapp: !!data.notify_whatsapp,
      notify_email_digest: !!data.notify_email_digest,
      default_radius_km: clamp(data.default_radius_km, 2, 15),
      max_radius_km: clamp(data.max_radius_km, 5, 25),
      auto_expand: !!data.auto_expand,
      mask_contacts: !!data.mask_contacts,
      hide_exact_location: !!data.hide_exact_location,
      requisition_retention_days: clamp(data.requisition_retention_days, 7, 180),
      updated_by: context.userId,
    };
    const { data: updated, error } = await supabaseAdmin
      .from("app_settings")
      .update(payload)
      .eq("singleton", true)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await supabaseAdmin.from("admin_audit_log").insert({
      action: "edit",
      target_type: "settings",
      target_id: updated.id,
      target_label: "Operations & Safety controls",
      actor: await actorEmail(context.userId),
    });
    return { settings: updated };
  });
