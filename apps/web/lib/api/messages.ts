import type { Conversation, Message } from "@/lib/types";
import { conversations } from "@/lib/mock-data";

// TODO(api): replace with apiFetch<Conversation[]>("/conversations")
export async function getConversations(): Promise<Conversation[]> {
  return structuredClone(conversations);
}

/** Envoie un message dans une conversation. */
export async function sendMessage(
  conversationId: string,
  text: string,
): Promise<Message> {
  // TODO(api): return apiFetch<Message>(`/conversations/${conversationId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
  if (process.env.NODE_ENV === "development") {
    console.log("sendMessage (mock)", { conversationId, text });
  }
  return { id: `msg-${Date.now()}`, text, createdAt: new Date().toISOString(), mine: true };
}
