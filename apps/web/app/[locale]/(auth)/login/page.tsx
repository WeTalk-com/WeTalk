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
import { login as apiLogin, register as apiRegister, AuthError } from "@/lib/api/auth";

type Mode = "login" | "signup" | "forgot";

function getPasswordStrength(password: string): 0 | 1 | 2 | 3 {
  if (password.length < 8) return 0;
  let score = 1;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  return score as 0 | 1 | 2 | 3;
}

function PasswordStrengthBar({
  password,
  labels,
}: {
  password: string;
  labels: [string, string, string];
}) {
  if (!password) return null;
  const score = getPasswordStrength(password);
  const colors = ["bg-live", "bg-amber-400", "bg-green-500"] as const;
  const color = score === 0 ? colors[0] : colors[Math.min(score - 1, 2)];
  const label = score <= 1 ? labels[0] : score === 2 ? labels[1] : labels[2];

  return (
    <div className="mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${score >= i ? color : "bg-border"}`}
          />
        ))}
      </div>
      <span className="text-xs text-brown-sec">{label}</span>
    </div>
  );
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function LoginPage() {
  const t = useTranslations("auth");
  const [mode, setMode] = useState<Mode>("login");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof typeof form, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof typeof form, string>>>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  const setField = (key: keyof typeof form) => (value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Efface l'erreur de champ dès que l'utilisateur retape
    if (fieldErrors[key]) setFieldErrors((e) => ({ ...e, [key]: undefined }));
    if (globalError) setGlobalError(null);
  };

  const touch = (key: keyof typeof form) => () => {
    setTouched((t) => ({ ...t, [key]: true }));
    validateField(key, form[key]);
  };

  function validateField(key: keyof typeof form, value: string): string | undefined {
    let error: string | undefined;
    if (key === "username") {
      if (value.length < 3) error = t("usernameErrorMin");
      else if (/\s/.test(value)) error = t("usernameErrorSpaces");
    } else if (key === "email") {
      if (!isValidEmail(value)) error = t("emailErrorInvalid");
    } else if (key === "password") {
      if (value.length < 8) error = t("passwordErrorMin");
    } else if (key === "confirmPassword") {
      if (value !== form.password) error = t("confirmPasswordError");
    }
    setFieldErrors((e) => ({ ...e, [key]: error }));
    return error;
  }

  function validateAll(): boolean {
    const fields: (keyof typeof form)[] =
      mode === "signup"
        ? ["username", "email", "password", "confirmPassword"]
        : ["email", "password"];

    const errors: Partial<Record<keyof typeof form, string>> = {};
    const newTouched: Partial<Record<keyof typeof form, boolean>> = {};
    let valid = true;

    for (const key of fields) {
      newTouched[key] = true;
      const err = validateField(key, form[key]);
      if (err) { errors[key] = err; valid = false; }
    }

    setTouched((t) => ({ ...t, ...newTouched }));
    setFieldErrors((e) => ({ ...e, ...errors }));
    return valid;
  }

  function isFieldValid(key: keyof typeof form): boolean {
    return !!touched[key] && !fieldErrors[key] && form[key].length > 0;
  }

  const canSubmit =
    mode === "signup"
      ? form.username.length >= 3 && isValidEmail(form.email) && form.password.length >= 8 && form.confirmPassword === form.password
      : form.email.length > 0 && form.password.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pending || mode === "forgot") return;
    if (!validateAll()) return;

    setGlobalError(null);
    setPending(true);
    try {
      if (mode === "signup") {
        await apiRegister(form.username, form.email, form.password);
      }
      await apiLogin(form.email, form.password);
      router.push("/home");
    } catch (err) {
      if (err instanceof AuthError) {
        switch (err.code) {
          case "username_taken":
            setFieldErrors((e) => ({ ...e, username: t("usernameErrorTaken") }));
            break;
          case "email_taken":
            setFieldErrors((e) => ({ ...e, email: t("emailErrorTaken") }));
            break;
          case "password_too_short":
            setFieldErrors((e) => ({ ...e, password: t("passwordErrorMin") }));
            break;
          default:
            setGlobalError(t("invalidCredentials"));
        }
      } else {
        setGlobalError(t("invalidCredentials"));
      }
      setPending(false);
    }
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setFieldErrors({});
    setTouched({});
    setGlobalError(null);
  };

  const copy = {
    login: { title: t("loginTitle"), subtitle: t("loginSubtitle"), cta: t("loginCta") },
    signup: { title: t("signupTitle"), subtitle: t("signupSubtitle"), cta: t("signupCta") },
    forgot: { title: t("forgotTitle"), subtitle: t("forgotSubtitle"), cta: t("forgotCta") },
  }[mode];

  return (
    <main className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-canvas px-4 py-10 font-body">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 size-170 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(239,159,39,0.16),transparent_65%)]"
      />

      <header className="relative z-10 mb-6 text-center">
        <h1 className="font-head text-[40px] font-extrabold italic leading-none text-brown">
          WeTalk
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[1.6px] text-brown-sec">
          {t("subtitle")}
        </p>
      </header>

      <div className="relative z-10 w-full max-w-104 rounded-card border border-border bg-card p-7.5 shadow-card">
        {mode === "forgot" ? (
          <button
            type="button"
            onClick={() => switchMode("login")}
            className="mb-5 inline-flex items-center gap-1.5 text-sm font-medium text-brown-sec transition-colors hover:text-brown"
          >
            <ArrowLeftIcon className="size-4" />
            {t("backToLogin")}
          </button>
        ) : (
          <div className="mb-6 flex rounded-field bg-cream p-1">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
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

        <h2 className="font-head text-[26px] font-extrabold text-brown">{copy.title}</h2>
        <p className="mt-1 text-brown-sec">{copy.subtitle}</p>

        <form onSubmit={handleSubmit} noValidate className="mt-6 flex flex-col gap-4">
          {/* Nom d'utilisateur (signup uniquement) */}
          {mode === "signup" && (
            <Field
              id="username"
              name="username"
              label={t("usernameLabel")}
              value={form.username}
              onChange={setField("username")}
              onBlur={touch("username")}
              placeholder={t("usernamePlaceholder")}
              autoComplete="username"
              autoFocus
              icon={<UserIcon />}
              hint={t("usernameHint")}
              error={touched.username ? fieldErrors.username : undefined}
              valid={isFieldValid("username")}
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
            onBlur={touch("email")}
            placeholder={t("emailPlaceholder")}
            autoComplete="email"
            autoFocus={mode === "login"}
            icon={<MailIcon />}
            error={touched.email ? fieldErrors.email : undefined}
            valid={isFieldValid("email")}
          />

          {/* Mot de passe */}
          {mode !== "forgot" && (
            <div>
              <Field
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                label={t("passwordLabel")}
                value={form.password}
                onChange={setField("password")}
                onBlur={touch("password")}
                placeholder="••••••••"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                icon={<LockIcon />}
                hint={mode === "signup" ? t("passwordHint") : undefined}
                error={touched.password ? fieldErrors.password : undefined}
                valid={isFieldValid("password")}
                trailing={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("hidePassword") : t("showPassword")}
                    className="shrink-0 text-placeholder transition-colors hover:text-gold"
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                }
              />
              {mode === "signup" && (
                <PasswordStrengthBar
                  password={form.password}
                  labels={[t("passwordStrengthWeak"), t("passwordStrengthFair"), t("passwordStrengthStrong")]}
                />
              )}
            </div>
          )}

          {/* Confirmer le mot de passe (signup uniquement) */}
          {mode === "signup" && (
            <Field
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirm ? "text" : "password"}
              label={t("confirmPasswordLabel")}
              value={form.confirmPassword}
              onChange={setField("confirmPassword")}
              onBlur={touch("confirmPassword")}
              placeholder="••••••••"
              autoComplete="new-password"
              icon={<LockIcon />}
              error={touched.confirmPassword ? fieldErrors.confirmPassword : undefined}
              valid={isFieldValid("confirmPassword")}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label={showConfirm ? t("hidePassword") : t("showPassword")}
                  className="shrink-0 text-placeholder transition-colors hover:text-gold"
                >
                  {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              }
            />
          )}

          {/* Se souvenir + Mot de passe oublié (login uniquement) */}
          {mode === "login" && (
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setRemember((v) => !v)}
                aria-pressed={remember}
                className="flex items-center gap-2 text-sm text-brown-sec"
              >
                <span
                  className={`grid size-4.5 place-items-center rounded-[5px] border-[1.5px] transition-colors ${
                    remember ? "border-gold bg-gold text-white" : "border-border bg-card"
                  }`}
                >
                  {remember && <CheckIcon className="size-3" />}
                </span>
                {t("rememberMe")}
              </button>
              <button
                type="button"
                onClick={() => switchMode("forgot")}
                className="text-sm font-medium text-gold hover:underline"
              >
                {t("forgotPassword")}
              </button>
            </div>
          )}

          {/* Erreur globale */}
          {globalError && (
            <p className="text-sm font-medium text-live">{globalError}</p>
          )}

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={pending || !canSubmit}
            className="h-13 rounded-[14px] bg-gold font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98] disabled:opacity-40"
          >
            {copy.cta}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-brown-sec">
          {mode === "login" && (
            <>
              {t("footerLoginPrompt")}{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
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
                onClick={() => switchMode("login")}
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
                onClick={() => switchMode("login")}
                className="font-semibold text-gold hover:underline"
              >
                {t("footerBackLink")}
              </button>
            </>
          )}
        </p>
      </div>

      <p className="relative z-10 mt-6 max-w-104 text-center text-xs text-brown-sec">
        {t.rich("legal", {
          terms: (chunks) => (
            <a href="#" className="underline hover:text-brown">{chunks}</a>
          ),
          privacy: (chunks) => (
            <a href="#" className="underline hover:text-brown">{chunks}</a>
          ),
        })}
      </p>
    </main>
  );
}
