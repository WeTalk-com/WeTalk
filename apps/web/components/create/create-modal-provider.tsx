"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import type { User } from "@/lib/types";
import { CreatePostModal } from "./create-post-modal";

type CreateModalCtx = { isOpen: boolean; open: () => void; close: () => void; currentUser: User };

const Ctx = createContext<CreateModalCtx | null>(null);

export function useCreateModal() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCreateModal must be used within <CreateModalProvider>");
  return ctx;
}

/** Utilisateur courant complet (déjà chargé côté serveur, zéro round-trip). */
export function useCurrentUser() {
  return useCreateModal().currentUser;
}

export function useCurrentUserId() {
  return useCreateModal().currentUser.id;
}

export function CreateModalProvider({
  user,
  children,
}: {
  user: User;
  children: ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <Ctx.Provider value={{ isOpen, open, close, currentUser: user }}>
      {children}
      {isOpen && <CreatePostModal user={user} onClose={close} />}
    </Ctx.Provider>
  );
}
