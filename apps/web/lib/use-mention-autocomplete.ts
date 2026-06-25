"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { apiFetch } from "./api/client";

type UserSuggestion = {
  id: string;
  username: string;
  displayName: string | null;
  profileImage: string | null;
};

function getMentionAtCursor(
  value: string,
  cursorPos: number,
): { start: number; query: string } | null {
  const before = value.slice(0, cursorPos);
  const match = before.match(/(?:^|\s)@(\w*)$/);
  if (!match) return null;
  const query = match[1] ?? "";
  // start = index juste après le "@" (indépendant de l'espace capturé en tête).
  return { start: cursorPos - query.length, query };
}

export function useMentionAutocomplete() {
  const [users, setUsers] = useState<UserSuggestion[]>([]);
  const [mention, setMention] = useState<{
    start: number;
    query: string;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const clear = useCallback(() => {
    setMention(null);
    setUsers([]);
    setLoading(false);
  }, []);

  const update = useCallback(
    (value: string, cursorPos: number) => {
      const m = getMentionAtCursor(value, cursorPos);
      setMention(m);

      if (!m || m.query.length < 1) {
        setUsers([]);
        return;
      }

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(async () => {
        setLoading(true);
        try {
          const data = await apiFetch<UserSuggestion[]>(
            `/users?search=${encodeURIComponent(m.query)}&limit=5`,
          );
          setUsers(data);
        } catch {
          setUsers([]);
        } finally {
          setLoading(false);
        }
      }, 200);
    },
    [],
  );

  const insertMention = useCallback(
    (username: string, currentValue: string, cursorPos: number) => {
      const m = getMentionAtCursor(currentValue, cursorPos);
      if (!m) return currentValue;
      const before = currentValue.slice(0, m.start);
      const after = currentValue.slice(cursorPos);
      return before + username + " " + after;
    },
    [],
  );

  return { users, mention, loading, update, insertMention, clear };
}
