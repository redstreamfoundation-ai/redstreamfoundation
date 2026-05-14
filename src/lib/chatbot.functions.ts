import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const InputSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

const SYSTEM_PROMPT = `You are Redstream Assistant, the bilingual (English + Hindi) helper for Redstream Foundation, a Delhi NCR non-profit that connects patients in urgent need of blood with verified, nearby volunteer donors.

CORE RULES
- Detect the language the user is writing in (English, Hindi in Devanagari, or romanised Hindi/Hinglish) and reply in that SAME language for your entire turn. Never mix languages within one reply unless the user does.
- Keep replies short, warm, and practical (2–5 sentences or a small numbered list). No long lectures.
- You are NOT a doctor. Do not give medical advice. For emergencies, urge calling 112 (India emergency) and going to the nearest hospital.
- Never collect or store sensitive details like Aadhaar, full address, or payment info. Phone and locality are fine because the site already collects them through forms.

WHAT YOU CAN HELP WITH
1. Donor registration — guide users to /donor/register and explain what info they will need (name, phone, blood group, locality, last donation date).
2. Blood requests — guide users to /request to submit a patient blood request (patient name, blood group, hospital, units, contact).
3. Eligibility basics — adults 18–65, weight 50kg+, gap of at least 90 days since last whole-blood donation, feeling well today.
4. Explain how matching works — verified donors near the hospital with the right blood group are notified; identities are masked until both sides agree.
5. Answer general questions about Redstream Foundation.

WHAT YOU CANNOT DO
- You cannot register a donor or submit a request on the user's behalf — always direct them to the correct page.
- You cannot share donor or patient personal data.
- You cannot promise a specific donor will be found.

TONE
- English: friendly, plain, no jargon.
- Hindi: सहज, सम्मानजनक, और छोटा। "आप" का प्रयोग करें।
- Hinglish: natural conversational Hinglish, no forced translation.

Always end with a clear next step (a link like /donor/register or /request, or a short follow-up question).`;

export const chatbotReply = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => InputSchema.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      throw new Error("Chat is not configured. LOVABLE_API_KEY missing.");
    }

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...data.messages,
        ],
      }),
    });

    if (res.status === 429) {
      throw new Error("Too many requests right now. Please try again in a moment.");
    }
    if (res.status === 402) {
      throw new Error("AI credits exhausted for this workspace. Please add funds.");
    }
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("AI gateway error", res.status, text);
      throw new Error("Sorry, I could not reach the assistant just now.");
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply = json.choices?.[0]?.message?.content?.trim();
    if (!reply) {
      throw new Error("Empty response from assistant.");
    }
    return { reply };
  });