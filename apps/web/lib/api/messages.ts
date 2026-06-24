import type { Conversation, Message } from "@/lib/types";
import { conversations } from "@/lib/mock-data";

/** Liste des conversations de l'utilisateur courant. */
export async function getConversations(): Promise<Conversation[]> {
  // TODO(api): return apiFetch<Conversation[]>("/conversations");
  return structuredClone(conversations);
}

/** Envoie un message dans une conversation. */
export async function sendMessage(
  _conversationId: string,
  text: string,
): Promise<Message> {
  // TODO(api): return apiFetch<Message>(`/conversations/${_conversationId}/messages`, { method: "POST", body: JSON.stringify({ text }) });
  return { id: `msg-${Date.now()}`, text, createdAt: new Date().toISOString(), mine: true };
}
