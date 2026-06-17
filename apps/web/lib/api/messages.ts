import type { Conversation } from "../types";
import { conversations } from "../mock-data";

// TODO(api): replace with apiFetch<Conversation[]>("/conversations")
export async function getConversations(): Promise<Conversation[]> {
  return conversations;
}
