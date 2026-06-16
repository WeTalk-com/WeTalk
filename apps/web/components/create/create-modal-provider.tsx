"use client";

import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { CreatePostModal } from "./create-post-modal";

type CreateModalCtx = { isOpen: boolean; open: () => void; close: () => void };

const Ctx = createContext<CreateModalCtx | null>(null);

export function useCreateModal() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error("useCreateModal must be used within <CreateModalProvider>");
  }
  return ctx;
}

export function CreateModalProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <Ctx.Provider value={{ isOpen, open, close }}>
      {children}
      {isOpen && <CreatePostModal onClose={close} />}
    </Ctx.Provider>
  );
}
