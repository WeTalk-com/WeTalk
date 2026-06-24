import type { Conversation, Message } from "@/lib/types";
import { apiFetch } from "./client";

type BackendConvEntry = {
  user: { id: string; name: string; handle: string; initial: string; verified: boolean };
  lastMessage: string;
  lastMessageAt: string | null;
  unread: number;
};

type BackendMessage = {
  id: string;
  text: string;
  createdAt: string;
  mine: boolean;
};

type BackendConversation = {
  user: { id: string; name: string; handle: string; initial: string; verified: boolean };
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: BackendMessage[];
};

/** Liste des conversations de l'utilisateur courant. */
export async function getConversations(): Promise<Conversation[]> {
  const data = await apiFetch<{ data: BackendConvEntry[] }>("/messages");
  return (data.data ?? []).map((c) => ({
    id: c.user.id,
    user: c.user,
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt ?? new Date().toISOString(),
    unread: c.unread,
    messages: [],
  }));
}

/** Messages d'une conversation avec un utilisateur (par son UUID). */
export async function getConversationMessages(userId: string): Promise<Message[]> {
  const data = await apiFetch<{ data: BackendConversation }>(
    `/messages/${encodeURIComponent(userId)}`,
  );
  return (data.data?.messages ?? []).reverse();
}

/** Envoie un message à un utilisateur (userId = UUID du destinataire). */
export async function sendMessage(userId: string, text: string): Promise<Message> {
  const data = await apiFetch<{ data: { _id: string; content: string; createdAt: string } }>(
    `/messages/${encodeURIComponent(userId)}`,
    { method: "POST", body: JSON.stringify({ content: text }) },
  );
  return {
    id: data.data._id,
    text: data.data.content,
    createdAt: data.data.createdAt,
    mine: true,
  };
}

/** Marque comme lus les messages reçus d'un utilisateur. */
export async function markConversationRead(userId: string): Promise<void> {
  await apiFetch(`/messages/${encodeURIComponent(userId)}/read`, { method: "PATCH" });
}
