"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { logout as apiLogout } from "@/lib/api/auth";

type Props = {
  /** "button" : bouton plein (page Réglages). "menu" : item de menu (sidebar). */
  variant?: "button" | "menu";
};

/** Déconnexion : invalide la session côté back (cookie httpOnly) puis renvoie au login. */
export function LogoutButton({ variant = "button" }: Props) {
  const t = useTranslations("auth");
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    if (pending) return;
    setPending(true);
    try {
      await apiLogout();
    } catch {
      // Même si l'appel échoue, on renvoie l'utilisateur vers le login.
    }
    router.replace("/login");
    router.refresh();
  }

  if (variant === "menu") {
    return (
      <button
        type="button"
        onClick={handleLogout}
        disabled={pending}
        className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-live disabled:opacity-50"
      >
        <LogOut className="size-4" />
        {t("logout")}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={pending}
      className="flex items-center gap-2 rounded-full border border-live/40 bg-live/10 px-5 py-2.5 text-sm font-semibold text-live transition-colors disabled:opacity-50"
    >
      <LogOut className="size-4" />
      {t("logout")}
    </button>
  );
}
