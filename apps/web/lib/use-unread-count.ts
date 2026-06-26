"use client";

import { useEffect, useSyncExternalStore } from "react";
import { getSocket } from "./socket";
import { getUnreadCount } from "./api/notifications";

// Compteur de notifications non lues partagé par toutes les pastilles (sidebar + mobile-nav),
// pour qu'elles restent synchrones et puissent être rafraîchies après lecture.
let count = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

/** Recharge le compteur depuis le serveur (à appeler après lecture de notifications). */
export async function refreshUnreadCount(): Promise<void> {
  try {
    count = await getUnreadCount();
    emit();
  } catch {
    /* silencieux */
  }
}

// Initialisation unique : fetch initial + écoute socket (nouvelle notif = +1).
let initialized = false;
function init() {
  if (initialized) return;
  initialized = true;
  refreshUnreadCount();
  const socket = getSocket();
  if (socket) {
    socket.on("notification:new", () => {
      count += 1;
      emit();
    });
    socket.connect();
  }
}

export function useUnreadCount() {
  useEffect(init, []);
  const value = useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    () => count,
    () => count,
  );
  return { count: value };
}
