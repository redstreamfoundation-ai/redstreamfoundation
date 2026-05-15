import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const MC_BASE = "https://cpaas.messagecentral.com";
const PHONE_EMAIL_DOMAIN = "phone.redstream.local";

const SendSchema = z.object({
  phone: z.string().regex(/^[6-9]\d{9}$/, "Enter a valid 10-digit Indian mobile number"),
});

const VerifySchema = z.object({
  verificationId: z.string().min(1),
  code: z.string().regex(/^\d{4,6}$/),
  phone: z.string().regex(/^[6-9]\d{9}$/),
  intendedRole: z.enum(["donor", "patient"]).default("donor"),
});

async function getMcToken(): Promise<string> {
  const customerId = process.env.MESSAGE_CENTRAL_CUSTOMER_ID;
  const apiKey = process.env.MESSAGE_CENTRAL_API_KEY;
  if (!customerId || !apiKey) throw new Error("Message Central credentials are not configured.");

  // Per Message Central docs: GET token endpoint with customerId + base64 key as query
  const url = new URL(`${MC_BASE}/auth/v1/authentication/token`);
  url.searchParams.set("customerId", customerId);
  url.searchParams.set("key", apiKey);
  url.searchParams.set("scope", "NEW");
  url.searchParams.set("country", "91");
  const res = await fetch(url.toString(), { method: "GET" });
  if (!res.ok) throw new Error(`Message Central token failed [${res.status}]: ${await res.text()}`);
  const data = (await res.json()) as { token?: string; authToken?: string };
  const token = data.token ?? data.authToken;
  if (!token) throw new Error("Message Central did not return a token");
  return token;
}

export const sendPhoneOtp = createServerFn({ method: "POST" })
  .inputValidator((input) => SendSchema.parse(input))
  .handler(async ({ data }) => {
    const token = await getMcToken();
    const url = new URL(`${MC_BASE}/verification/v3/send`);
    url.searchParams.set("countryCode", "91");
    url.searchParams.set("flowType", "SMS");
    url.searchParams.set("mobileNumber", data.phone);
    const res = await fetch(url.toString(), {
      method: "POST",
      headers: { authToken: token },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`Failed to send OTP [${res.status}]: ${JSON.stringify(body)}`);
    }
    const verificationId =
      body?.data?.verificationId ?? body?.verificationId ?? body?.data?.transactionId;
    if (!verificationId) {
      throw new Error(`OTP send response missing verificationId: ${JSON.stringify(body)}`);
    }
    return { verificationId: String(verificationId) };
  });

function derivePassword(phone: string): string {
  const apiKey = process.env.MESSAGE_CENTRAL_API_KEY ?? "";
  // Deterministic per-phone password (server-side only). Strong enough for Supabase.
  // Use Web Crypto via Node's globalThis.crypto.subtle equivalent: simple HMAC-like via SHA-256.
  const seed = `rs:${apiKey}:${phone}`;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { createHash } = require("crypto") as typeof import("crypto");
  return "Rs!" + createHash("sha256").update(seed).digest("base64").slice(0, 40);
}

export const verifyPhoneOtpAndSignIn = createServerFn({ method: "POST" })
  .inputValidator((input) => VerifySchema.parse(input))
  .handler(async ({ data }) => {
    const token = await getMcToken();
    const url = new URL(`${MC_BASE}/verification/v3/validateOtp`);
    url.searchParams.set("verificationId", data.verificationId);
    url.searchParams.set("code", data.code);
    url.searchParams.set("countryCode", "91");
    url.searchParams.set("mobileNumber", data.phone);
    const res = await fetch(url.toString(), {
      method: "GET",
      headers: { authToken: token },
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(`OTP validation failed [${res.status}]: ${JSON.stringify(body)}`);
    }
    const verificationStatus =
      body?.data?.verificationStatus ?? body?.verificationStatus ?? body?.responseCode;
    const ok =
      verificationStatus === "VERIFICATION_COMPLETED" ||
      verificationStatus === "AUTH_COMPLETED" ||
      verificationStatus === 200;
    if (!ok) {
      throw new Error(
        typeof body?.message === "string" ? body.message : "Invalid OTP. Please try again.",
      );
    }

    // Establish a Supabase identity for this phone number using a deterministic email/password.
    const email = `${data.phone}@${PHONE_EMAIL_DOMAIN}`;
    const password = derivePassword(data.phone);

    // Try sign-in first.
    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const anon = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });

    let signIn = await anon.auth.signInWithPassword({ email, password });
    if (signIn.error) {
      // Create user via admin (auto-confirmed) and retry.
      const created = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          phone: data.phone,
          intended_role: data.intendedRole,
          full_name: "",
        },
      });
      if (created.error && !/already.*registered|exists/i.test(created.error.message)) {
        throw new Error(`Could not create account: ${created.error.message}`);
      }
      signIn = await anon.auth.signInWithPassword({ email, password });
      if (signIn.error || !signIn.data.session) {
        throw new Error(signIn.error?.message ?? "Sign-in failed after account creation");
      }
    }

    const session = signIn.data.session!;
    return {
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    };
  });