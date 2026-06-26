import { apiFetch } from "./client";

/**
 * Envoie un message à l'assistant IA et renvoie sa réponse.
 */
export async function sendChatMessage(message: string): Promise<string> {
  const data = await apiFetch<{ answer: string }>("/chat", {
    method: "POST",
    body: JSON.stringify({ message }),
    signal: AbortSignal.timeout(120_000),
  });
  return data.answer;
}
