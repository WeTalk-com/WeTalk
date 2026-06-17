import type { Conversation } from "@/lib/types";
import { conversations } from "@/lib/mock-data";

// TODO(api): replace with apiFetch<Conversation[]>("/conversations")
export async function getConversations(): Promise<Conversation[]> {
  return structuredClone(conversations);
}
