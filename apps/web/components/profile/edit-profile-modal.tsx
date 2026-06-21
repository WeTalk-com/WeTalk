"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { X, Camera } from "lucide-react";
import { useTranslations } from "next-intl";
import type { Profile } from "@/lib/types";
import { updateProfile } from "@/lib/api";
import { Avatar } from "@/components/ui/avatar";
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
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: profile.name,
    bio: profile.bio,
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [banner, setBanner] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string | null>(null);
  const avatarRef = useRef<HTMLInputElement>(null);
  const bannerRef = useRef<HTMLInputElement>(null);

  function set(key: keyof typeof form) {
    return (v: string) => setForm((prev) => ({ ...prev, [key]: v }));
  }

  function resetMedia() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setAvatar(null);
    setAvatarPreview(null);
    setBanner(null);
    setBannerPreview(null);
    if (avatarRef.current) avatarRef.current.value = "";
    if (bannerRef.current) bannerRef.current.value = "";
  }

  function onAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatar(file);
    setAvatarPreview(URL.createObjectURL(file));
  }

  function onBannerChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBanner(file);
    setBannerPreview(URL.createObjectURL(file));
  }

  const handleClose = useCallback(() => {
    setOpen(false);
    setError(null);
    setForm({
      name: profile.name,
      bio: profile.bio,
    });
    resetMedia();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  async function handleSave() {
    setPending(true);
    setError(null);
    try {
      // On n'envoie que les champs valides côté backend (displayName ≥ 3,
      // description ≥ 1). Les champs vides sont omis -> inchangés, ce qui évite
      // un 400 (cas d'un profil sans bio).
      const displayName = form.name.trim();
      const description = form.bio.trim();
      await updateProfile({
        displayName: displayName.length >= 3 ? displayName : undefined,
        description: description.length >= 1 ? description : undefined,
        avatar: avatar ?? undefined,
        banner: banner ?? undefined,
      });
      resetMedia();
      setOpen(false);
      router.refresh();
    } catch {
      setError(t("editError"));
    } finally {
      setPending(false);
    }
  }

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

            {/* Bannière + avatar (Fx10) */}
            <div className="relative">
              <button
                type="button"
                aria-label={t("editBanner")}
                onClick={() => bannerRef.current?.click()}
                className="group relative block h-28 w-full overflow-hidden bg-gold/10"
              >
                {(bannerPreview ?? profile.bannerUrl) && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={bannerPreview ?? profile.bannerUrl}
                    alt=""
                    className="size-full object-cover"
                  />
                )}
                <span className="absolute inset-0 grid place-items-center bg-dark/30 text-canvas opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-6" />
                </span>
              </button>

              <button
                type="button"
                aria-label={t("editAvatar")}
                onClick={() => avatarRef.current?.click()}
                className="group absolute -bottom-8 left-5 rounded-full ring-4 ring-canvas"
              >
                <Avatar
                  initial={profile.initial}
                  src={avatarPreview ?? profile.avatarUrl}
                  solid
                  size={72}
                />
                <span className="absolute inset-0 grid place-items-center rounded-full bg-dark/30 text-canvas opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="size-5" />
                </span>
              </button>
            </div>

            <input
              ref={avatarRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onAvatarChange}
            />
            <input
              ref={bannerRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onBannerChange}
            />

            {/* Form */}
            <div className="flex flex-col gap-4 px-5 pb-5 pt-12">
              <Field label={t("editName")} value={form.name} onChange={set("name")} maxLength={50} />
              <Field label={t("editBio")} value={form.bio} onChange={set("bio")} multiline maxLength={160} />
            </div>

            {error && (
              <p className="px-5 pb-1 text-sm text-live" role="alert">
                {error}
              </p>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 border-t border-border px-5 py-4">
              <Button variant="outline" size="sm" onClick={() => handleClose()} disabled={pending}>
                {t("editCancel")}
              </Button>
              <Button size="sm" onClick={handleSave} disabled={pending}>
                {t("editSave")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
