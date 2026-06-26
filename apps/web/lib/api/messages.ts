import type { Conversation, Message, User } from "@/lib/types";
import { apiFetch } from "./client";

type BackendConvUser = {
  id: string;
  name: string;
  handle: string;
  initial: string;
  profileImage?: string | null;
  verified: boolean;
};

type BackendConvEntry = {
  user: BackendConvUser;
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
  user: BackendConvUser;
  lastMessage: string;
  lastMessageAt: string;
  unread: number;
  messages: BackendMessage[];
};

// Le back expose la photo via `profileImage` ; le modèle front attend `avatarUrl`.
function mapConvUser(u: BackendConvUser): User {
  return {
    id: u.id,
    name: u.name,
    handle: u.handle,
    initial: u.initial,
    avatarUrl: u.profileImage ?? undefined,
    verified: u.verified,
  };
}

/** Liste des conversations de l'utilisateur courant. */
export async function getConversations(): Promise<Conversation[]> {
  const data = await apiFetch<{ data: BackendConvEntry[] }>("/messages");
  return (data.data ?? []).map((c) => ({
    id: c.user.id,
    user: mapConvUser(c.user),
    lastMessage: c.lastMessage,
    lastMessageAt: c.lastMessageAt ?? new Date().toISOString(),
    unread: c.unread,
    messages: [],
  }));
}

/** Messages d'une conversation avec un utilisateur (par son UUID). */
export async function getConversationMessages(userId: string): Promise<Message[]> {
  // silent: true — un 404 (conversation vide) ne doit pas déclencher wetalk:unauthorized.
  const data = await apiFetch<{ data: BackendConversation }>(
    `/messages/${encodeURIComponent(userId)}`,
    { silent: true },
  ).catch(() => null);
  return (data?.data?.messages ?? []).reverse();
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
