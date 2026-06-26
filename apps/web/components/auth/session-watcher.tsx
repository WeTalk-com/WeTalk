"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";

/**
 * Écoute l'événement "wetalk:unauthorized" émis par apiFetch côté client
 * et redirige vers /login quand la session expire en cours de navigation.
 */
export function SessionWatcher() {
  const router = useRouter();

  useEffect(() => {
    function handleUnauthorized() {
      router.replace("/login");
    }
    window.addEventListener("wetalk:unauthorized", handleUnauthorized);
    return () => window.removeEventListener("wetalk:unauthorized", handleUnauthorized);
  }, [router]);

  return null;
}
