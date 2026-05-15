// Single edge function with action dispatch.
// Actions are routed via JSON body { action: string, payload?: any }.
// Auth: bearer token from caller; admin checks via service-role role lookup.

import { createClient } from "npm:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors, "Content-Type": "application/json" },
  });

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

function userClient(authHeader: string) {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
}

async function getUser(authHeader: string | null) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const { data } = await admin.auth.getUser(authHeader.slice(7));
  return data.user ?? null;
}

async function assertAdmin(userId: string) {
  const { data, error } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden: admin role required");
}

async function actorEmail(userId: string) {
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email ?? userId;
}

async function audit(entry: {
  action: string;
  target_type: string;
  target_id: string;
  target_label: string | null;
  actor: string;
}) {
  await admin.from("admin_audit_log").insert(entry);
}

type Handler = (payload: any, ctx: { userId: string; authHeader: string }) => Promise<unknown>;

const ADMIN_HANDLERS: Record<string, Handler> = {
  adminListDonors: async (p, { userId }) => {
    await assertAdmin(userId);
    let q = admin
      .from("donors")
      .select(
        "id, full_name, phone, blood_group, locality, pincode, status, verified, created_at, last_donation_date, age, availability, id_proof_url, source"
      )
      .order("created_at", { ascending: false });
    if (p?.source && p.source !== "all") q = q.eq("source", p.source);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { donors: data ?? [] };
  },

  adminListRequests: async (p, { userId }) => {
    await assertAdmin(userId);
    let q = admin
      .from("blood_requests")
      .select(
        "id, attendant_name, attendant_phone, blood_group, hospital, locality, units, urgency, component, patient_age, status, admin_status, created_at, patient_name, requisition_url, source"
      )
      .order("created_at", { ascending: false });
    if (p?.source && p.source !== "all") q = q.eq("source", p.source);
    const { data, error } = await q;
    if (error) throw new Error(error.message);
    return { requests: data ?? [] };
  },

  adminUpdateDonorStatus: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data: existing } = await admin.from("donors").select("full_name").eq("id", p.id).single();
    const { error } = await admin
      .from("donors")
      .update({ status: p.status, verified: p.status === "approved" })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    await audit({
      action: p.status,
      target_type: "donor",
      target_id: p.id,
      target_label: existing?.full_name ?? null,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminUpdateDonor: async (p, { userId }) => {
    await assertAdmin(userId);
    const { error } = await admin
      .from("donors")
      .update({
        full_name: p.full_name,
        phone: p.phone,
        blood_group: p.blood_group,
        locality: p.locality,
        pincode: p.pincode ?? "",
        last_donation_date: p.last_donation_date,
      })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    await audit({
      action: "edit",
      target_type: "donor",
      target_id: p.id,
      target_label: p.full_name,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminDeleteDonor: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data: existing } = await admin.from("donors").select("full_name").eq("id", p.id).single();
    const { error } = await admin.from("donors").delete().eq("id", p.id);
    if (error) throw new Error(error.message);
    await audit({
      action: "delete",
      target_type: "donor",
      target_id: p.id,
      target_label: existing?.full_name ?? null,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminUpdateRequestStatus: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data: existing } = await admin
      .from("blood_requests")
      .select("attendant_name, hospital, blood_group")
      .eq("id", p.id)
      .single();
    const { error } = await admin
      .from("blood_requests")
      .update({ admin_status: p.status })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    const label = existing
      ? `${existing.attendant_name} · ${existing.blood_group} · ${existing.hospital}`
      : null;
    await audit({
      action: p.status,
      target_type: "request",
      target_id: p.id,
      target_label: label,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminUpdateRequest: async (p, { userId }) => {
    await assertAdmin(userId);
    const { error } = await admin
      .from("blood_requests")
      .update({
        attendant_name: p.attendant_name,
        attendant_phone: p.attendant_phone,
        blood_group: p.blood_group,
        hospital: p.hospital,
        locality: p.locality,
        units: p.units,
        component: p.component,
        urgency: p.urgency,
        patient_age: p.patient_age,
      })
      .eq("id", p.id);
    if (error) throw new Error(error.message);
    await audit({
      action: "edit",
      target_type: "request",
      target_id: p.id,
      target_label: `${p.attendant_name} · ${p.blood_group} · ${p.hospital}`,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminDeleteRequest: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data: existing } = await admin
      .from("blood_requests")
      .select("attendant_name, hospital, blood_group")
      .eq("id", p.id)
      .maybeSingle();
    const { error } = await admin.from("blood_requests").delete().eq("id", p.id);
    if (error) throw new Error(error.message);
    const label = existing
      ? `${existing.attendant_name} · ${existing.blood_group} · ${existing.hospital}`
      : null;
    await audit({
      action: "delete",
      target_type: "request",
      target_id: p.id,
      target_label: label,
      actor: await actorEmail(userId),
    });
    return { ok: true };
  },

  adminGetSignedDocumentUrl: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data, error } = await admin.storage.from(p.bucket).createSignedUrl(p.path, 600);
    if (error) throw new Error(error.message);
    return { url: data.signedUrl };
  },

  adminGetRequestDetail: async (p, { userId }) => {
    await assertAdmin(userId);
    const { data: req, error } = await admin
      .from("blood_requests")
      .select("*")
      .eq("id", p.id)
      .single();
    if (error) throw new Error(error.message);
    const { data: donors, error: dErr } = await admin
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
  },

  adminGetStats: async (_p, { userId }) => {
    await assertAdmin(userId);
    const [a, b, c, d, e] = await Promise.all([
      admin.from("donors").select("id", { count: "exact", head: true }),
      admin.from("donors").select("id", { count: "exact", head: true }).eq("status", "pending"),
      admin.from("donors").select("id", { count: "exact", head: true }).eq("status", "approved"),
      admin.from("blood_requests").select("id", { count: "exact", head: true }),
      admin
        .from("blood_requests")
        .select("id", { count: "exact", head: true })
        .eq("admin_status", "pending"),
    ]);
    return {
      totalDonors: a.count ?? 0,
      pendingDonors: b.count ?? 0,
      approvedDonors: c.count ?? 0,
      totalRequests: d.count ?? 0,
      pendingRequests: e.count ?? 0,
    };
  },

  adminListAudit: async (p, { userId }) => {
    await assertAdmin(userId);
    const limit = Math.min(Math.max(p?.limit ?? 500, 1), 2000);
    const { data, error } = await admin
      .from("admin_audit_log")
      .select("id, action, target_type, target_id, target_label, actor, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);
    return { entries: data ?? [] };
  },

  adminGetSettings: async (_p, { userId }) => {
    await assertAdmin(userId);
    const { data, error } = await admin
      .from("app_settings")
      .select("*")
      .eq("singleton", true)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!data) {
      const { data: created, error: insErr } = await admin
        .from("app_settings")
        .insert({ singleton: true })
        .select("*")
        .single();
      if (insErr) throw new Error(insErr.message);
      return { settings: created };
    }
    return { settings: data };
  },

  adminUpdateSettings: async (p, { userId }) => {
    await assertAdmin(userId);
    const clamp = (n: number, lo: number, hi: number) =>
      Math.min(hi, Math.max(lo, Math.round(n)));
    const payload = {
      notify_push: !!p.notify_push,
      notify_sms: !!p.notify_sms,
      notify_whatsapp: !!p.notify_whatsapp,
      notify_email_digest: !!p.notify_email_digest,
      default_radius_km: clamp(p.default_radius_km, 2, 15),
      max_radius_km: clamp(p.max_radius_km, 5, 25),
      auto_expand: !!p.auto_expand,
      mask_contacts: !!p.mask_contacts,
      hide_exact_location: !!p.hide_exact_location,
      requisition_retention_days: clamp(p.requisition_retention_days, 7, 180),
      updated_by: userId,
    };
    const { data, error } = await admin
      .from("app_settings")
      .update(payload)
      .eq("singleton", true)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    await audit({
      action: "edit",
      target_type: "settings",
      target_id: data.id,
      target_label: "Operations & Safety controls",
      actor: await actorEmail(userId),
    });
    return { settings: data };
  },
};

const USER_HANDLERS: Record<string, Handler> = {
  registerDonorFromChat: async (p, { userId, authHeader }) => {
    const sb = userClient(authHeader);
    let lastDonation: string | null = null;
    if (p.last_donation_date) {
      const d = new Date(p.last_donation_date);
      if (!Number.isNaN(d.getTime())) lastDonation = d.toISOString().slice(0, 10);
    }
    const payload = {
      user_id: userId,
      full_name: p.full_name,
      phone: p.phone,
      blood_group: p.blood_group,
      age: p.age,
      locality: p.locality,
      pincode: "",
      availability: p.availability,
      last_donation_date: lastDonation,
      id_proof_url: p.id_proof_url,
      status: "pending",
      source: "chatbot",
    };
    const { data: existing, error: selErr } = await sb
      .from("donors")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    if (selErr) throw new Error(selErr.message);
    const op = existing
      ? sb.from("donors").update(payload).eq("user_id", userId)
      : sb.from("donors").insert(payload);
    const { error } = await op;
    if (error) throw new Error(error.message);
    return { ok: true };
  },

  submitBloodRequestFromChat: async (p, { userId, authHeader }) => {
    const sb = userClient(authHeader);
    const mapU = (u: string) =>
      u === "urgent_2h" ? "critical" : u === "same_day" ? "urgent" : "standard";
    const payload = {
      created_by: userId,
      patient_name: p.patient_name,
      blood_group: p.blood_group,
      component: "Whole Blood",
      units: p.units,
      hospital: p.hospital,
      locality: p.locality,
      attendant_name: p.attendant_name,
      attendant_phone: p.attendant_phone,
      urgency: mapU(p.urgency),
      requisition_url: p.requisition_url,
      proof_uploaded: true,
      status: "pending",
      admin_status: "pending",
      source: "chatbot",
    };
    const { error } = await sb.from("blood_requests").insert(payload);
    if (error) throw new Error(error.message);
    return { ok: true };
  },
};

const SYSTEM_PROMPT = `You are Redstream Assistant, the bilingual (English + Hindi) helper for Redstream Foundation, a Delhi NCR non-profit that connects patients in urgent need of blood with verified, nearby volunteer donors. Many users contacting you are anxious or in a stressful medical situation — be warm, calm, and reassuring at all times.

CORE RULES
- Detect the language the user is writing in (English, Hindi in Devanagari, or romanised Hindi/Hinglish) and reply in that SAME language for your entire turn. Never mix languages within one reply unless the user does.
- Keep replies short, warm, and practical (2–5 sentences or a small numbered list). No long lectures.
- If the user seems confused, off-topic, or unsure, gently guide them back: ask whether they'd like to (a) register as a blood donor, or (b) request blood for a patient. Mention they can type 'help' for the helpline or 'restart' to start over.
- You are NOT a doctor. Do not give medical advice. For emergencies, urge calling 112 (India emergency) and going to the nearest hospital.
- Never collect or store sensitive details like Aadhaar, full address, or payment info. Phone and locality are fine because the site already collects them through forms.

WHAT YOU CAN HELP WITH
1. Donor registration — invite the user to type 'register donor' to start the in-chat registration, or visit /donor/register.
2. Blood requests — invite the user to type 'need blood' to start the in-chat request, or visit /request.
3. Eligibility basics — adults 18–65, weight 50kg+, gap of at least 90 days since last whole-blood donation, feeling well today.
4. Explain how matching works — verified donors near the hospital with the right blood group are notified; identities are masked until both sides agree.
5. Answer general questions about Redstream Foundation.

Always end with a clear next step — usually one of: 'register donor', 'need blood', 'help', or a short follow-up question.`;

const MC_BASE = "https://cpaas.messagecentral.com";
const MC_CUSTOMER_ID = Deno.env.get("MESSAGE_CENTRAL_CUSTOMER_ID") ?? "";
const MC_API_KEY = Deno.env.get("MESSAGE_CENTRAL_API_KEY") ?? "";
const PHONE_EMAIL_DOMAIN = "phone.redstream.local";

async function mcToken(): Promise<string> {
  if (!MC_CUSTOMER_ID || !MC_API_KEY) {
    throw new Error("Phone OTP is not configured. Missing Message Central credentials.");
  }
  const url = new URL(`${MC_BASE}/auth/v1/authentication/token`);
  url.searchParams.set("customerId", MC_CUSTOMER_ID);
  url.searchParams.set("key", MC_API_KEY);
  url.searchParams.set("scope", "NEW");
  url.searchParams.set("country", "91");
  const res = await fetch(url.toString(), { method: "GET" });
  const text = await res.text();
  if (!res.ok) throw new Error(`Message Central token failed [${res.status}]: ${text}`);
  let body: Record<string, unknown> = {};
  try { body = JSON.parse(text); } catch { /* noop */ }
  const token = (body.token ?? body.authToken) as string | undefined;
  if (!token) throw new Error("Message Central did not return a token");
  return token;
}

function validIndianMobile(phone: unknown): phone is string {
  return typeof phone === "string" && /^[6-9]\d{9}$/.test(phone);
}

async function derivePassword(phone: string): Promise<string> {
  const data = new TextEncoder().encode(`rs:${MC_API_KEY}:${phone}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
  return "Rs!" + b64.replace(/[+/=]/g, "x").slice(0, 40);
}

const PUBLIC_HANDLERS: Record<string, (p: any) => Promise<unknown>> = {
  chatbotReply: async (p) => {
    if (!LOVABLE_API_KEY) throw new Error("Chat is not configured. LOVABLE_API_KEY missing.");
    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...(p.messages ?? [])],
      }),
    });
    if (res.status === 429) throw new Error("Too many requests right now. Please try again in a moment.");
    if (res.status === 402) throw new Error("AI credits exhausted for this workspace.");
    if (!res.ok) {
      console.error("AI gateway error", res.status, await res.text().catch(() => ""));
      throw new Error("Sorry, I could not reach the assistant just now.");
    }
    const j = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    const reply = j.choices?.[0]?.message?.content?.trim();
    if (!reply) throw new Error("Empty response from assistant.");
    return { reply };
  },

  sendPhoneOtp: async (p) => {
    if (!validIndianMobile(p?.phone)) {
      throw new Error("Enter a valid 10-digit Indian mobile number.");
    }
    const token = await mcToken();
    const url = new URL(`${MC_BASE}/verification/v3/send`);
    url.searchParams.set("countryCode", "91");
    url.searchParams.set("flowType", "SMS");
    url.searchParams.set("mobileNumber", p.phone);
    const res = await fetch(url.toString(), { method: "POST", headers: { authToken: token } });
    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) {
      const msg = (body as { message?: string })?.message ?? `OTP send failed [${res.status}]`;
      throw new Error(msg);
    }
    const d = (body as { data?: Record<string, unknown> }).data ?? {};
    const verificationId =
      d.verificationId ?? (body as Record<string, unknown>).verificationId ?? d.transactionId;
    if (!verificationId) throw new Error("OTP send response missing verificationId.");
    return { verificationId: String(verificationId) };
  },

  verifyPhoneOtp: async (p) => {
    if (!validIndianMobile(p?.phone)) throw new Error("Invalid phone number.");
    const code = String(p?.code ?? "");
    const verificationId = String(p?.verificationId ?? "");
    if (!/^\d{4,6}$/.test(code)) throw new Error("Enter the OTP from your SMS.");
    if (!verificationId) throw new Error("Missing verification id. Please request a new OTP.");
    const intendedRole: "donor" | "patient" = p?.intendedRole === "patient" ? "patient" : "donor";

    const token = await mcToken();
    const url = new URL(`${MC_BASE}/verification/v3/validateOtp`);
    url.searchParams.set("verificationId", verificationId);
    url.searchParams.set("code", code);
    url.searchParams.set("countryCode", "91");
    url.searchParams.set("mobileNumber", p.phone);
    const res = await fetch(url.toString(), { method: "GET", headers: { authToken: token } });
    const body = await res.json().catch(() => ({} as Record<string, unknown>));
    if (!res.ok) {
      const msg = (body as { message?: string })?.message ?? `OTP validation failed [${res.status}]`;
      throw new Error(msg);
    }
    const d = (body as { data?: Record<string, unknown> }).data ?? {};
    const status = d.verificationStatus ?? (body as Record<string, unknown>).verificationStatus;
    if (status !== "VERIFICATION_COMPLETED" && status !== "AUTH_COMPLETED") {
      const msg = (body as { message?: string })?.message ?? "Invalid OTP. Please try again.";
      throw new Error(msg);
    }

    // Establish a Supabase identity for this phone via deterministic email/password.
    const email = `${p.phone}@${PHONE_EMAIL_DOMAIN}`;
    const password = await derivePassword(p.phone);
    const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    let signInData = (await anon.auth.signInWithPassword({ email, password })).data;
    if (!signInData?.session) {
      const created = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { phone: p.phone, intended_role: intendedRole, full_name: "" },
      });
      if (created.error && !/already|exists|registered/i.test(created.error.message)) {
        throw new Error(`Could not create account: ${created.error.message}`);
      }
      const retry = await anon.auth.signInWithPassword({ email, password });
      if (retry.error || !retry.data.session) {
        throw new Error(retry.error?.message ?? "Sign-in failed after account creation.");
      }
      signInData = retry.data;
    }

    return {
      access_token: signInData.session!.access_token,
      refresh_token: signInData.session!.refresh_token,
      intendedRole,
    };
  },
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let body: { action?: string; payload?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid JSON" }, 400);
  }

  const action = body.action;
  if (!action || typeof action !== "string") return json({ error: "Missing action" }, 400);

  try {
    if (PUBLIC_HANDLERS[action]) {
      const data = await PUBLIC_HANDLERS[action](body.payload ?? {});
      return json({ data });
    }

    const authHeader = req.headers.get("Authorization");
    const user = await getUser(authHeader);
    if (!user) return json({ error: "Unauthorized" }, 401);

    const ctx = { userId: user.id, authHeader: authHeader! };

    if (ADMIN_HANDLERS[action]) {
      const data = await ADMIN_HANDLERS[action](body.payload ?? {}, ctx);
      return json({ data });
    }
    if (USER_HANDLERS[action]) {
      const data = await USER_HANDLERS[action](body.payload ?? {}, ctx);
      return json({ data });
    }
    return json({ error: `Unknown action: ${action}` }, 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.startsWith("Forbidden") ? 403 : 400;
    console.error(`[api] ${action}:`, message);
    return json({ error: message }, status);
  }
});