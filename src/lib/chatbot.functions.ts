import { action } from "./api-client";

export const chatbotReply = action<
  { messages: Array<{ role: "user" | "assistant"; content: string }> },
  { reply: string }
>("chatbotReply");