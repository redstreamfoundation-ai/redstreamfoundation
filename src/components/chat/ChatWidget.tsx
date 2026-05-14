import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, X, Send, Loader2, Paperclip } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatbotReply } from "@/lib/chatbot.functions";
import { registerDonorFromChat } from "@/lib/donor-registration.functions";
import { supabase } from "@/integrations/supabase/client";

type ChatMessage = { role: "user" | "assistant"; content: string };

type Lang = "en" | "hi";

type RegStep =
  | "idle"
  | "name"
  | "phone"
  | "blood"
  | "age"
  | "locality"
  | "last_donation"
  | "availability"
  | "id_proof"
  | "confirm"
  | "submitting"
  | "done";

type RegData = {
  full_name?: string;
  phone?: string;
  blood_group?: string;
  age?: number;
  locality?: string;
  last_donation_date?: string | null;
  availability?: string;
  id_proof_url?: string;
};

const VALID_BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const T = {
  en: {
    askName: "Great! Let's register you as a donor. What is your full name?",
    askPhone: "Thanks! What is your phone number? (10 digits)",
    askBlood: "What is your blood group? (A+, A-, B+, B-, AB+, AB-, O+, O-)",
    askAge: "How old are you? (must be 18–65)",
    askLocality: "Which area or nearest landmark do you live near?",
    askLast:
      "When did you last donate blood? (date like 2024-05-10, or type 'never')",
    askAvail:
      "What's your availability? Reply 'weekdays', 'weekends', or 'anytime'.",
    askIdProof:
      "Please upload a valid ID proof photo (Aadhaar/Driving Licence/Voter ID). Tap 📎 below to attach.",
    needLogin:
      "To save your registration securely, please sign in first at /auth, then start again with 'register donor'.",
    summary: (d: RegData) =>
      `Please confirm your details:\n• Name: ${d.full_name}\n• Phone: ${d.phone}\n• Blood group: ${d.blood_group}\n• Age: ${d.age}\n• Location: ${d.locality}\n• Last donation: ${d.last_donation_date ?? "Never"}\n• Availability: ${d.availability}\n• ID proof: uploaded ✓\n\nReply 'yes' to confirm or 'no' to cancel.`,
    saving: "Saving your registration…",
    success:
      "Thank you! Your registration has been received and will be reviewed within 24 hours. We'll contact you on your phone once you're verified. ❤️",
    cancelled: "No problem — registration cancelled. Type 'register donor' anytime to start again.",
    badPhone: "That doesn't look like a valid phone number. Please enter 10 digits.",
    badBlood: "Please reply with one of: A+, A-, B+, B-, AB+, AB-, O+, O-.",
    badAge: "Please enter an age between 18 and 65.",
    badAvail: "Please reply with 'weekdays', 'weekends', or 'anytime'.",
    uploadFail: "Could not upload that file. Please try a smaller image (under 5 MB).",
    saveFail: "Sorry, we couldn't save your registration. Please try again later.",
  },
  hi: {
    askName: "बढ़िया! आइए आपको डोनर के रूप में पंजीकृत करें। आपका पूरा नाम क्या है?",
    askPhone: "धन्यवाद! आपका फ़ोन नंबर क्या है? (10 अंक)",
    askBlood: "आपका ब्लड ग्रुप क्या है? (A+, A-, B+, B-, AB+, AB-, O+, O-)",
    askAge: "आपकी उम्र क्या है? (18–65 के बीच होनी चाहिए)",
    askLocality: "आप किस इलाके या नज़दीकी लैंडमार्क के पास रहते हैं?",
    askLast:
      "आपने आख़िरी बार रक्तदान कब किया था? (तारीख़ जैसे 2024-05-10, या 'never' लिखें)",
    askAvail:
      "आप कब उपलब्ध रहते हैं? 'weekdays', 'weekends', या 'anytime' लिखें।",
    askIdProof:
      "कृपया एक वैध पहचान पत्र (आधार/ड्राइविंग लाइसेंस/वोटर ID) की फोटो अपलोड करें। नीचे 📎 पर टैप करें।",
    needLogin:
      "आपकी जानकारी सुरक्षित रूप से सहेजने के लिए, कृपया पहले /auth पर साइन इन करें, फिर 'register donor' लिखकर फिर शुरू करें।",
    summary: (d: RegData) =>
      `कृपया अपनी जानकारी की पुष्टि करें:\n• नाम: ${d.full_name}\n• फ़ोन: ${d.phone}\n• ब्लड ग्रुप: ${d.blood_group}\n• उम्र: ${d.age}\n• स्थान: ${d.locality}\n• अंतिम रक्तदान: ${d.last_donation_date ?? "कभी नहीं"}\n• उपलब्धता: ${d.availability}\n• ID प्रूफ़: अपलोड हो गया ✓\n\nपुष्टि के लिए 'yes' लिखें या रद्द करने के लिए 'no'.`,
    saving: "आपका पंजीकरण सहेजा जा रहा है…",
    success:
      "धन्यवाद! आपका पंजीकरण प्राप्त हो गया है और 24 घंटे के भीतर समीक्षा की जाएगी। सत्यापन के बाद हम आपके फ़ोन पर संपर्क करेंगे। ❤️",
    cancelled: "कोई बात नहीं — पंजीकरण रद्द कर दिया गया। फिर शुरू करने के लिए कभी भी 'register donor' लिखें।",
    badPhone: "यह सही फ़ोन नंबर नहीं लगता। कृपया 10 अंक दर्ज करें।",
    badBlood: "कृपया इनमें से एक लिखें: A+, A-, B+, B-, AB+, AB-, O+, O-.",
    badAge: "कृपया 18 और 65 के बीच की उम्र दर्ज करें।",
    badAvail: "कृपया 'weekdays', 'weekends', या 'anytime' लिखें।",
    uploadFail: "फ़ाइल अपलोड नहीं हो सकी। कृपया छोटी इमेज (5 MB से कम) आज़माएँ।",
    saveFail: "क्षमा करें, हम आपका पंजीकरण सहेज नहीं सके। कृपया बाद में पुनः प्रयास करें।",
  },
} as const;

function detectLang(text: string): Lang {
  // Devanagari range
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  return "en";
}

function isDonorIntent(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\b(register|sign\s*up|become).*(donor|donate|donation)\b/.test(t) ||
    /\b(donor|donate|donation)\b.*\b(register|sign\s*up|become)\b/.test(t) ||
    t === "register donor" ||
    t === "become a donor" ||
    /डोनर|दान|रक्तदान|रजिस्टर/.test(text)
  );
}

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "Hello! / नमस्ते! I am Redstream Assistant. I can help you register as a donor or submit a blood request. Please reply in English or Hindi — both work fine. / मैं डोनर पंजीकरण या ब्लड रिक्वेस्ट में आपकी मदद कर सकता हूँ। आप अंग्रेज़ी या हिंदी में जवाब दे सकते हैं।",
};

export function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [regStep, setRegStep] = useState<RegStep>("idle");
  const [regData, setRegData] = useState<RegData>({});
  const [regLang, setRegLang] = useState<Lang>("en");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendChat = useServerFn(chatbotReply);
  const submitDonor = useServerFn(registerDonorFromChat);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, open, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function pushAssistant(content: string) {
    setMessages((prev) => [...prev, { role: "assistant", content }]);
  }

  async function startRegistration(lang: Lang) {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      pushAssistant(T[lang].needLogin);
      return;
    }
    setRegLang(lang);
    setRegData({});
    setRegStep("name");
    pushAssistant(T[lang].askName);
  }

  async function handleRegistrationStep(text: string) {
    const t = T[regLang];
    switch (regStep) {
      case "name": {
        if (text.length < 2) return pushAssistant(t.askName);
        setRegData((d) => ({ ...d, full_name: text }));
        setRegStep("phone");
        return pushAssistant(t.askPhone);
      }
      case "phone": {
        const digits = text.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13) return pushAssistant(t.badPhone);
        setRegData((d) => ({ ...d, phone: digits }));
        setRegStep("blood");
        return pushAssistant(t.askBlood);
      }
      case "blood": {
        const bg = text.toUpperCase().replace(/\s/g, "");
        if (!VALID_BLOOD.includes(bg)) return pushAssistant(t.badBlood);
        setRegData((d) => ({ ...d, blood_group: bg }));
        setRegStep("age");
        return pushAssistant(t.askAge);
      }
      case "age": {
        const n = parseInt(text, 10);
        if (Number.isNaN(n) || n < 18 || n > 65) return pushAssistant(t.badAge);
        setRegData((d) => ({ ...d, age: n }));
        setRegStep("locality");
        return pushAssistant(t.askLocality);
      }
      case "locality": {
        if (text.length < 2) return pushAssistant(t.askLocality);
        setRegData((d) => ({ ...d, locality: text }));
        setRegStep("last_donation");
        return pushAssistant(t.askLast);
      }
      case "last_donation": {
        const lower = text.toLowerCase();
        const never = ["never", "no", "none", "nahi", "नहीं", "कभी नहीं"].some((w) =>
          lower.includes(w),
        );
        const value = never ? null : text;
        setRegData((d) => ({ ...d, last_donation_date: value }));
        setRegStep("availability");
        return pushAssistant(t.askAvail);
      }
      case "availability": {
        const lower = text.toLowerCase();
        let val: string | null = null;
        if (/weekday|सप्ताह के दिन|वीकडे/.test(lower)) val = "weekdays";
        else if (/weekend|वीकेंड|शनि|रवि/.test(lower)) val = "weekends";
        else if (/anytime|कभी भी|हमेशा/.test(lower)) val = "anytime";
        if (!val) return pushAssistant(t.badAvail);
        setRegData((d) => ({ ...d, availability: val! }));
        setRegStep("id_proof");
        return pushAssistant(t.askIdProof);
      }
      case "id_proof": {
        // Wait for file upload via paperclip
        return pushAssistant(t.askIdProof);
      }
      case "confirm": {
        const lower = text.toLowerCase().trim();
        if (/^(yes|y|haan|हाँ|हां|ok|okay|confirm|पुष्टि)/.test(lower)) {
          await submitRegistration();
        } else if (/^(no|n|cancel|nahi|नहीं|रद्द)/.test(lower)) {
          setRegStep("idle");
          setRegData({});
          pushAssistant(t.cancelled);
        } else {
          pushAssistant(t.summary(regData));
        }
        return;
      }
    }
  }

  async function submitRegistration() {
    const t = T[regLang];
    setRegStep("submitting");
    pushAssistant(t.saving);
    try {
      await submitDonor({
        data: {
          full_name: regData.full_name!,
          phone: regData.phone!,
          blood_group: regData.blood_group!,
          age: regData.age!,
          locality: regData.locality!,
          last_donation_date: regData.last_donation_date ?? null,
          availability: regData.availability!,
          id_proof_url: regData.id_proof_url!,
        },
      });
      setRegStep("done");
      pushAssistant(t.success);
    } catch (err) {
      console.error(err);
      setRegStep("confirm");
      pushAssistant(err instanceof Error ? err.message : t.saveFail);
    }
  }

  async function handleFileSelected(file: File) {
    if (regStep !== "id_proof") return;
    const t = T[regLang];
    if (file.size > 5 * 1024 * 1024) {
      pushAssistant(t.uploadFail);
      return;
    }
    setUploading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        pushAssistant(t.needLogin);
        setRegStep("idle");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("donor-id-proofs")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      setRegData((d) => {
        const next = { ...d, id_proof_url: path };
        // Use the freshly merged object for the summary
        setRegStep("confirm");
        pushAssistant(T[regLang].summary(next));
        return next;
      });
    } catch (err) {
      console.error(err);
      pushAssistant(t.uploadFail);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;
    setError(null);
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");

    // If we're inside the registration flow, handle scripted step
    if (regStep !== "idle" && regStep !== "done") {
      await handleRegistrationStep(text);
      return;
    }

    // Detect donor-registration intent and start flow
    if (isDonorIntent(text)) {
      await startRegistration(detectLang(text));
      return;
    }

    setLoading(true);
    try {
      // Send only role+content turns (skip the static greeting from the start
      // so the model sees the user's first real message as the conversation
      // opener, but include all prior turns for context).
      const history = next
        .filter((m, i) => !(i === 0 && m === GREETING))
        .map((m) => ({ role: m.role, content: m.content }));
      const res = await sendChat({ data: { messages: history } });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "Sorry, something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      {/* Floating launcher */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat with Redstream Assistant"}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background sm:bottom-6 sm:right-6"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Redstream Assistant chat"
          className="fixed bottom-24 right-3 z-50 flex h-[min(70vh,560px)] w-[min(92vw,380px)] flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-2xl sm:right-6"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border bg-card px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <MessageCircle className="h-4 w-4" />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-foreground">
                  Redstream Assistant
                </p>
                <p className="text-[11px] text-muted-foreground">
                  English · हिंदी
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close chat"
              className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 space-y-3 overflow-y-auto bg-background px-3 py-3"
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground"
                    : "mr-auto max-w-[90%] rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-foreground"
                }
              >
                {m.content.split("\n").map((line, idx) => (
                  <p key={idx} className={idx > 0 ? "mt-1" : ""}>
                    {line}
                  </p>
                ))}
              </div>
            ))}
            {loading && (
              <div className="mr-auto flex items-center gap-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Typing…</span>
              </div>
            )}
            {error && (
              <div className="mr-auto max-w-[90%] rounded-2xl rounded-bl-sm border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {error}
              </div>
            )}
          </div>

          {/* Composer */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-border bg-card px-3 py-2"
          >
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFileSelected(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || regStep !== "id_proof"}
              aria-label="Attach ID proof photo"
              title="Attach ID proof photo"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Paperclip className="h-4 w-4" />
              )}
            </button>
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type in English or Hindi…"
              maxLength={2000}
              disabled={loading}
              className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>
        </div>
      )}
    </>
  );
}