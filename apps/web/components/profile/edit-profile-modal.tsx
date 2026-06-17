"use client";

import { useState, useEffect, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/types";
import { Button } from "@/components/ui/button";

function Field({
  label,
  value,
  onChange,
  multiline = false,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  maxLength?: number;
}) {
  const cls =
    "w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-brown outline-none placeholder:text-placeholder focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all";

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold uppercase tracking-wide text-brown-sec">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          rows={3}
          className={`${cls} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
          className={cls}
        />
      )}
      {maxLength !== undefined && (
        <span className="self-end text-xs text-brown-sec">
          {value.length}/{maxLength}
        </span>
      )}
    </div>
  );
}

export function EditProfileButton({ profile }: { profile: Profile }) {
  const t = useTranslations("app.profile");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: profile.name,
    handle: profile.handle,
    bio: profile.bio,
    location: profile.location,
  });

  function set(key: keyof typeof form) {
    return (v: string) => setForm((prev) => ({ ...prev, [key]: v }));
  }

  const handleClose = useCallback(() => {
    setOpen(false);
    setForm({
      name: profile.name,
      handle: profile.handle,
      bio: profile.bio,
      location: profile.location,
    });
  }, [profile]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") handleClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <Button variant="outline" size="sm" className="mb-1" onClick={() => setOpen(true)}>
        {t("editProfile")}
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-dark/40 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
        >
          <div className="w-full max-w-md rounded-2xl bg-canvas shadow-card">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="font-display text-lg font-bold text-brown">
                {t("editProfileTitle")}
              </h2>
              <button
                type="button"
                aria-label={t("editCancel")}
                onClick={() => handleClose()}
                className="grid size-8 place-items-center rounded-full text-brown-sec transition-colors hover:bg-gold/10 hover:text-gold"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Form */}
            <div className="flex flex-col gap-4 px-5 py-5">
              <Field label={t("editName")} value={form.name} onChange={set("name")} maxLength={50} />
              <Field label={t("editHandle")} value={form.handle} onChange={set("handle")} maxLength={30} />
              <Field label={t("editBio")} value={form.bio} onChange={set("bio")} multiline maxLength={160} />
              <Field label={t("editLocation")} value={form.location} onChange={set("location")} maxLength={30} />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="outline" size="sm" onClick={() => handleClose()}>
                {t("editCancel")}
              </Button>
              <Button size="sm" onClick={() => setOpen(false)}>
                {t("editSave")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
