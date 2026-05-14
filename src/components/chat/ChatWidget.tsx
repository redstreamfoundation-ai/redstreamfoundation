import { useEffect, useRef, useState, type FormEvent } from "react";
import { MessageCircle, X, Send, Loader2, Paperclip } from "lucide-react";
import { useServerFn } from "@tanstack/react-start";
import { chatbotReply } from "@/lib/chatbot.functions";
import { registerDonorFromChat } from "@/lib/donor-registration.functions";
import { submitBloodRequestFromChat } from "@/lib/blood-request.functions";
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

type ReqStep =
  | "idle"
  | "patient_name"
  | "blood"
  | "units"
  | "hospital"
  | "locality"
  | "attendant_name"
  | "attendant_phone"
  | "urgency"
  | "requisition"
  | "confirm"
  | "submitting"
  | "done";

type ReqData = {
  patient_name?: string;
  blood_group?: string;
  units?: number;
  hospital?: string;
  locality?: string;
  attendant_name?: string;
  attendant_phone?: string;
  urgency?: "urgent_2h" | "same_day" | "within_24h";
  requisition_url?: string;
};

const VALID_BLOOD = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const HELPLINE_PHONE = "+91 11 4000 0000";
const HELPLINE_TEL = "+911140000000";
const HELPLINE_EMAIL = "help@redstreamfoundation.org";

const HELP_TEXT = {
  en: `We're here for you 💛\n\n📞 Emergency helpline: ${HELPLINE_PHONE} (24×7)\n✉️ Email: ${HELPLINE_EMAIL}\n\nFor a life-threatening emergency, please also call 112 and head to the nearest hospital. You can type 'register donor' to sign up as a donor, 'need blood' to request blood, or 'restart' to start over.`,
  hi: `हम आपके साथ हैं 💛\n\n📞 आपातकालीन हेल्पलाइन: ${HELPLINE_PHONE} (24×7)\n✉️ ईमेल: ${HELPLINE_EMAIL}\n\nजान को ख़तरा हो तो कृपया 112 पर भी कॉल करें और नज़दीकी अस्पताल जाएँ। डोनर बनने के लिए 'register donor', रक्त की ज़रूरत के लिए 'need blood', या फिर से शुरू करने के लिए 'restart' लिखें।`,
} as const;

const RESTART_TEXT = {
  en: "Okay, let's start fresh. 🌱 Would you like to register as a blood donor, or do you need to request blood for a patient? You can also type 'help' anytime.",
  hi: "ठीक है, हम फिर से शुरू करते हैं। 🌱 क्या आप रक्तदाता के रूप में पंजीकरण करना चाहेंगे, या आपको किसी मरीज़ के लिए रक्त चाहिए? कभी भी 'help' लिख सकते हैं।",
} as const;

const NUDGE_TEXT = {
  en: "I'm here to help, and I want to make this easy for you. 💛 Would you like to:\n\n• Register as a blood donor — type 'register donor'\n• Request blood for a patient — type 'need blood'\n• See helpline contacts — type 'help'\n\nYou can write in English or Hindi, whichever feels comfortable.",
  hi: "मैं आपकी मदद के लिए यहाँ हूँ, और इसे आसान बनाना चाहता हूँ। 💛 क्या आप:\n\n• रक्तदाता बनना चाहते हैं — 'register donor' लिखें\n• किसी मरीज़ के लिए रक्त चाहिए — 'need blood' लिखें\n• हेल्पलाइन संपर्क देखना चाहते हैं — 'help' लिखें\n\nआप अंग्रेज़ी या हिंदी, जो भी सहज लगे, में लिख सकते हैं।",
} as const;

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
    reqAskPatient: "Let's submit a blood request. What is the patient's full name?",
    reqAskBlood: "Which blood group is needed? (A+, A-, B+, B-, AB+, AB-, O+, O-)",
    reqAskUnits: "How many units are required? (1–20)",
    reqAskHospital: "Which hospital is the patient admitted in? (name)",
    reqAskLocality: "What is the hospital address or area/landmark?",
    reqAskAttName: "What is the attendant's name (the person we should coordinate with)?",
    reqAskAttPhone: "What is the attendant's phone number? (10 digits)",
    reqAskUrgency:
      "How urgent is the requirement? Reply 'urgent' (within 2 hours), 'today' (same day), or '24h' (within 24 hours).",
    reqAskSlip:
      "Please upload the hospital requisition slip (photo or PDF). Tap 📎 below to attach.",
    reqBadUnits: "Please enter a number between 1 and 20.",
    reqBadUrgency: "Please reply with 'urgent', 'today', or '24h'.",
    reqSummary: (d: ReqData) =>
      `Please confirm the request:\n• Patient: ${d.patient_name}\n• Blood group: ${d.blood_group}\n• Units: ${d.units}\n• Hospital: ${d.hospital}\n• Address: ${d.locality}\n• Attendant: ${d.attendant_name} (${d.attendant_phone})\n• Urgency: ${urgencyLabel(d.urgency!, "en")}\n• Requisition slip: uploaded ✓\n\nReply 'yes' to confirm or 'no' to cancel.`,
    reqSuccess:
      "Your request has been received. A coordinator will reach out within 30 minutes on the attendant's phone. ❤️",
    reqCancelled: "Request cancelled. Type 'need blood' anytime to start again.",
    reqSaveFail: "Sorry, we couldn't save your request. Please try again later.",
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
    reqAskPatient: "आइए ब्लड रिक्वेस्ट दर्ज करें। मरीज़ का पूरा नाम क्या है?",
    reqAskBlood: "किस ब्लड ग्रुप की ज़रूरत है? (A+, A-, B+, B-, AB+, AB-, O+, O-)",
    reqAskUnits: "कितनी यूनिट चाहिए? (1–20)",
    reqAskHospital: "मरीज़ किस अस्पताल में भर्ती हैं? (नाम बताइए)",
    reqAskLocality: "अस्पताल का पता या इलाक़ा/लैंडमार्क क्या है?",
    reqAskAttName: "अटेंडेंट का नाम क्या है (जिनसे हम संपर्क करें)?",
    reqAskAttPhone: "अटेंडेंट का फ़ोन नंबर क्या है? (10 अंक)",
    reqAskUrgency:
      "कितनी जल्दी ज़रूरत है? 'urgent' (2 घंटे में), 'today' (आज ही), या '24h' (24 घंटे में) लिखें।",
    reqAskSlip:
      "कृपया अस्पताल की requisition slip (फोटो या PDF) अपलोड करें। नीचे 📎 पर टैप करें।",
    reqBadUnits: "कृपया 1 से 20 के बीच की संख्या दर्ज करें।",
    reqBadUrgency: "कृपया 'urgent', 'today', या '24h' लिखें।",
    reqSummary: (d: ReqData) =>
      `कृपया अनुरोध की पुष्टि करें:\n• मरीज़: ${d.patient_name}\n• ब्लड ग्रुप: ${d.blood_group}\n• यूनिट: ${d.units}\n• अस्पताल: ${d.hospital}\n• पता: ${d.locality}\n• अटेंडेंट: ${d.attendant_name} (${d.attendant_phone})\n• तत्परता: ${urgencyLabel(d.urgency!, "hi")}\n• Requisition slip: अपलोड हो गई ✓\n\nपुष्टि के लिए 'yes' लिखें या रद्द करने के लिए 'no'.`,
    reqSuccess:
      "आपका अनुरोध प्राप्त हो गया है। एक coordinator 30 मिनट के भीतर अटेंडेंट के फ़ोन पर संपर्क करेगा। ❤️",
    reqCancelled: "अनुरोध रद्द कर दिया गया। फिर से शुरू करने के लिए कभी भी 'need blood' लिखें।",
    reqSaveFail: "क्षमा करें, हम आपका अनुरोध सहेज नहीं सके। कृपया बाद में पुनः प्रयास करें।",
  },
} as const;

function urgencyLabel(u: NonNullable<ReqData["urgency"]>, lang: Lang): string {
  if (lang === "hi") {
    if (u === "urgent_2h") return "बहुत ज़रूरी (2 घंटे में)";
    if (u === "same_day") return "आज ही";
    return "24 घंटे में";
  }
  if (u === "urgent_2h") return "Urgent (within 2 hours)";
  if (u === "same_day") return "Same day";
  return "Within 24 hours";
}

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

function isRequestIntent(text: string): boolean {
  const t = text.toLowerCase();
  return (
    /\bneed (blood|plasma|platelets)\b/.test(t) ||
    /\b(request|require|looking for).*(blood|donor)\b/.test(t) ||
    /\b(blood|plasma|platelets).*(needed|required|urgent)\b/.test(t) ||
    /रक्त चाहिए|खून चाहिए|ब्लड चाहिए|रक्त की ज़रूरत|खून की ज़रूरत|रिक्वेस्ट/.test(text)
  );
}

function isHelpIntent(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    t === "help" ||
    t === "/help" ||
    t === "?" ||
    /^help\b/.test(t) ||
    /मदद|सहायता|हेल्प/.test(text)
  );
}

function isRestartIntent(text: string): boolean {
  const t = text.trim().toLowerCase();
  return (
    t === "restart" ||
    t === "/restart" ||
    t === "reset" ||
    t === "start over" ||
    /^restart\b/.test(t) ||
    /फिर\s*से\s*शुरू|दोबारा\s*शुरू|रीस्टार्ट|शुरू\s*से/.test(text)
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
  const [reqStep, setReqStep] = useState<ReqStep>("idle");
  const [reqData, setReqData] = useState<ReqData>({});
  const [reqLang, setReqLang] = useState<Lang>("en");
  const [uploading, setUploading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const sendChat = useServerFn(chatbotReply);
  const submitDonor = useServerFn(registerDonorFromChat);
  const submitRequest = useServerFn(submitBloodRequestFromChat);

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

  async function startRequest(lang: Lang) {
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) {
      pushAssistant(T[lang].needLogin);
      return;
    }
    setReqLang(lang);
    setReqData({});
    setReqStep("patient_name");
    pushAssistant(T[lang].reqAskPatient);
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

  async function handleRequestStep(text: string) {
    const t = T[reqLang];
    switch (reqStep) {
      case "patient_name": {
        if (text.length < 2) return pushAssistant(t.reqAskPatient);
        setReqData((d) => ({ ...d, patient_name: text }));
        setReqStep("blood");
        return pushAssistant(t.reqAskBlood);
      }
      case "blood": {
        const bg = text.toUpperCase().replace(/\s/g, "");
        if (!VALID_BLOOD.includes(bg)) return pushAssistant(t.badBlood);
        setReqData((d) => ({ ...d, blood_group: bg }));
        setReqStep("units");
        return pushAssistant(t.reqAskUnits);
      }
      case "units": {
        const n = parseInt(text.replace(/\D/g, ""), 10);
        if (Number.isNaN(n) || n < 1 || n > 20) return pushAssistant(t.reqBadUnits);
        setReqData((d) => ({ ...d, units: n }));
        setReqStep("hospital");
        return pushAssistant(t.reqAskHospital);
      }
      case "hospital": {
        if (text.length < 2) return pushAssistant(t.reqAskHospital);
        setReqData((d) => ({ ...d, hospital: text }));
        setReqStep("locality");
        return pushAssistant(t.reqAskLocality);
      }
      case "locality": {
        if (text.length < 1) return pushAssistant(t.reqAskLocality);
        setReqData((d) => ({ ...d, locality: text }));
        setReqStep("attendant_name");
        return pushAssistant(t.reqAskAttName);
      }
      case "attendant_name": {
        if (text.length < 2) return pushAssistant(t.reqAskAttName);
        setReqData((d) => ({ ...d, attendant_name: text }));
        setReqStep("attendant_phone");
        return pushAssistant(t.reqAskAttPhone);
      }
      case "attendant_phone": {
        const digits = text.replace(/\D/g, "");
        if (digits.length < 10 || digits.length > 13) return pushAssistant(t.badPhone);
        setReqData((d) => ({ ...d, attendant_phone: digits }));
        setReqStep("urgency");
        return pushAssistant(t.reqAskUrgency);
      }
      case "urgency": {
        const lower = text.toLowerCase();
        let val: ReqData["urgency"] | null = null;
        if (/urgent|2\s*h|दो घंटे|बहुत ज़रूरी|बहुत जरूरी/.test(lower)) val = "urgent_2h";
        else if (/today|same\s*day|आज/.test(lower)) val = "same_day";
        else if (/24|day|कल|घंटे/.test(lower)) val = "within_24h";
        if (!val) return pushAssistant(t.reqBadUrgency);
        setReqData((d) => ({ ...d, urgency: val! }));
        setReqStep("requisition");
        return pushAssistant(t.reqAskSlip);
      }
      case "requisition": {
        return pushAssistant(t.reqAskSlip);
      }
      case "confirm": {
        const lower = text.toLowerCase().trim();
        if (/^(yes|y|haan|हाँ|हां|ok|okay|confirm|पुष्टि)/.test(lower)) {
          await submitRequestNow();
        } else if (/^(no|n|cancel|nahi|नहीं|रद्द)/.test(lower)) {
          setReqStep("idle");
          setReqData({});
          pushAssistant(t.reqCancelled);
        } else {
          pushAssistant(t.reqSummary(reqData));
        }
        return;
      }
    }
  }

  async function submitRequestNow() {
    const t = T[reqLang];
    setReqStep("submitting");
    pushAssistant(t.saving);
    try {
      await submitRequest({
        data: {
          patient_name: reqData.patient_name!,
          blood_group: reqData.blood_group!,
          units: reqData.units!,
          hospital: reqData.hospital!,
          locality: reqData.locality!,
          attendant_name: reqData.attendant_name!,
          attendant_phone: reqData.attendant_phone!,
          urgency: reqData.urgency!,
          requisition_url: reqData.requisition_url!,
        },
      });
      setReqStep("done");
      pushAssistant(t.reqSuccess);
    } catch (err) {
      console.error(err);
      setReqStep("confirm");
      pushAssistant(err instanceof Error ? err.message : t.reqSaveFail);
    }
  }

  async function handleFileSelected(file: File) {
    const isDonorUpload = regStep === "id_proof";
    const isRequestUpload = reqStep === "requisition";
    if (!isDonorUpload && !isRequestUpload) return;
    const lang = isDonorUpload ? regLang : reqLang;
    const t = T[lang];
    const maxBytes = isRequestUpload ? 10 * 1024 * 1024 : 5 * 1024 * 1024;
    if (file.size > maxBytes) {
      pushAssistant(t.uploadFail);
      return;
    }
    setUploading(true);
    try {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        pushAssistant(t.needLogin);
        if (isDonorUpload) setRegStep("idle");
        else setReqStep("idle");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${uid}/${Date.now()}.${ext}`;
      const bucket = isDonorUpload ? "donor-id-proofs" : "blood-requisitions";
      const { error: upErr } = await supabase.storage
        .from(bucket)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      if (isDonorUpload) {
        setRegData((d) => {
          const next = { ...d, id_proof_url: path };
          setRegStep("confirm");
          pushAssistant(T[regLang].summary(next));
          return next;
        });
      } else {
        setReqData((d) => {
          const next = { ...d, requisition_url: path };
          setReqStep("confirm");
          pushAssistant(T[reqLang].reqSummary(next));
          return next;
        });
      }
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

    const lang = detectLang(text);

    // Global commands — always available, even mid-flow
    if (isHelpIntent(text)) {
      pushAssistant(HELP_TEXT[lang]);
      return;
    }
    if (isRestartIntent(text)) {
      setRegStep("idle");
      setRegData({});
      setReqStep("idle");
      setReqData({});
      pushAssistant(RESTART_TEXT[lang]);
      return;
    }

    // If we're inside the registration flow, handle scripted step
    if (regStep !== "idle" && regStep !== "done") {
      await handleRegistrationStep(text);
      return;
    }
    if (reqStep !== "idle" && reqStep !== "done") {
      await handleRequestStep(text);
      return;
    }

    // Detect donor-registration intent and start flow
    if (isDonorIntent(text)) {
      await startRegistration(lang);
      return;
    }
    if (isRequestIntent(text)) {
      await startRequest(lang);
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
      // Soft fallback — gently guide the user back to the main options
      console.error(err);
      pushAssistant(NUDGE_TEXT[lang]);
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
              accept={reqStep === "requisition" ? "image/*,application/pdf" : "image/*"}
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
              disabled={
                uploading || (regStep !== "id_proof" && reqStep !== "requisition")
              }
              aria-label="Attach file"
              title="Attach file"
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