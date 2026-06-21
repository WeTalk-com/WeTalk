"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Field } from "@/components/auth/field";
import {
  MailIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ArrowLeftIcon,
} from "@/components/icons/form";
import { useRouter } from "@/i18n/navigation";
import { login as apiLogin, register as apiRegister } from "@/lib/api/auth";

type Mode = "login" | "signup" | "forgot";

export default function LoginPage() {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const copy = {
    login: {
      title: t("loginTitle"),
      subtitle: t("loginSubtitle"),
      cta: t("loginCta"),
    },
    signup: {
      title: t("signupTitle"),
      subtitle: t("signupSubtitle"),
      cta: t("signupCta"),
    },
    forgot: {
      title: t("forgotTitle"),
      subtitle: t("forgotSubtitle"),
      cta: t("forgotCta"),
    },
  }[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // "forgot" n'a pas d'endpoint backend (placeholder).
    if (pending || mode === "forgot") return;
    setError(null);
    setPending(true);
    try {
      // L'inscription ne connecte pas : on enchaîne register puis login.
      if (mode === "signup") {
        await apiRegister(form.name, form.email, form.password);
      }
      await apiLogin(form.email, form.password);
      router.push("/home");
    } catch {
      setError(t("invalidCredentials"));
      setPending(false);
    }
  };

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-10 font-body">
      {/* Halo radial doux derriere la carte */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.16),transparent_65%)]"
      />

      {/* En-tete */}
      <header className="relative z-10 mb-6 text-center">
        <h1 className="font-head text-[40px] font-extrabold italic leading-none text-brown">
          WeTalk
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[1.6px] text-brown-sec">
          {t("subtitle")}
        </p>
      </header>

      {/* Carte */}
      <div className="relative z-10 w-full max-w-[416px] rounded-card border border-border bg-card p-[30px] shadow-card">
        {/* Bascule mode (ou retour en mode forgot) */}
        {mode === "forgot" ? (
          <button
            type="button"
            onClick={() => setMode("login")}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brown-sec transition-colors hover:text-brown"
          >
            <ArrowLeftIcon className="size-4" />
            {t("backToLogin")}
          </button>
        ) : (
          <div className="mb-6 flex rounded-[13px] bg-cream p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`flex-1 rounded-[10px] py-2.5 text-sm font-semibold transition-all ${
                  mode === m
                    ? "bg-card text-brown shadow-[0_2px_6px_rgba(65,36,2,0.08)]"
                    : "text-brown-sec"
                }`}
              >
                {m === "login" ? t("toggleLogin") : t("toggleSignup")}
              </button>
            ))}
          </div>
        )}

        {/* Heading */}
        <h2 className="font-head text-[26px] font-extrabold text-brown">
          {copy.title}
        </h2>
        <p className="mt-1 text-brown-sec">{copy.subtitle}</p>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4">
          {/* Full name (signup) */}
          {mode === "signup" && (
            <Field
              id="name"
              name="name"
              label={t("nameLabel")}
              value={form.name}
              onChange={setField("name")}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              icon={<UserIcon />}
            />
          )}

          {/* Email */}
          <Field
            id="email"
            name="email"
            type="email"
            label={t("emailLabel")}
            value={form.email}
            onChange={setField("email")}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            icon={<MailIcon />}
          />

          {/* Password (login / signup) */}
          {mode !== "forgot" && (
            <Field
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label={t("passwordLabel")}
              value={form.password}
              onChange={setField("password")}
              placeholder="••••••••"
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
              icon={<LockIcon />}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={
                    showPassword ? t("hidePassword") : t("showPassword")
                  }
                  className="shrink-0 text-placeholder transition-colors hover:text-gold"
                >
                  {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          )}

          {/* Remember + Forgot (login uniquement) */}
          {mode === "login" && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember((v) => !v)}
                aria-pressed={remember}
                className="flex items-center gap-2 text-sm text-brown-sec"
              >
                <span
                  className={`grid size-[18px] place-items-center rounded-[5px] border-[1.5px] transition-colors ${
                    remember
                      ? "border-gold bg-gold text-white"
                      : "border-border bg-card"
                  }`}
                >
                  {remember && <CheckIcon className="size-3" />}
                </span>
                {t("rememberMe")}
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm font-medium text-gold hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
          )}

          {/* Erreur d'authentification */}
          {error && <p className="text-sm font-medium text-live">{error}</p>}

          {/* CTA */}
          <button
            type="submit"
            disabled={pending}
            className="h-[52px] rounded-[14px] bg-gold font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-50"
          >
            {copy.cta}
          </button>
        </form>

        {/* Footer bascule */}
        <p className="mt-6 text-center text-sm text-brown-sec">
          {mode === "login" && (
            <>
              {t("footerLoginPrompt")}{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-gold hover:underline"
              >
                {t("footerCreateAccount")}
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              {t("footerSignupPrompt")}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-gold hover:underline"
              >
                {t("footerLoginLink")}
              </button>
            </>
          )}
          {mode === "forgot" && (
            <>
              {t("footerForgotPrompt")}{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-gold hover:underline"
              >
                {t("footerBackLink")}
              </button>
            </>
          )}
        </p>
      </div>

      {/* Mention legale */}
      <p className="relative z-10 mt-6 max-w-[416px] text-center text-xs text-brown-sec">
        {t.rich("legal", {
          terms: (chunks) => (
            <a href="#" className="underline hover:text-brown">
              {chunks}
            </a>
          ),
          privacy: (chunks) => (
            <a href="#" className="underline hover:text-brown">
              {chunks}
            </a>
          ),
        })}
      </p>
    </main>
  );
}
