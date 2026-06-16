"use client";

import { useState } from "react";
import { Field } from "./field";
import {
  MailIcon,
  PhoneIcon,
  LockIcon,
  UserIcon,
  EyeIcon,
  EyeOffIcon,
  CheckIcon,
  ArrowLeftIcon,
} from "./icons";
import { GoogleIcon } from "@/app/_components/ui/icons";

type Mode = "login" | "signup" | "forgot";
type Method = "email" | "phone";

const COPY: Record<Mode, { title: string; subtitle: string; cta: string }> = {
  login: {
    title: "Welcome back",
    subtitle: "Log in to pick up where you left off.",
    cta: "Log in",
  },
  signup: {
    title: "Create your account",
    subtitle: "Join the warm side of the internet.",
    cta: "Create account",
  },
  forgot: {
    title: "Reset your password",
    subtitle: "Enter your email and we'll send you a link to get back in.",
    cta: "Send reset link",
  },
};

export default function LoginPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [method, setMethod] = useState<Method>("email");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const setField = (key: keyof typeof form) => (value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const copy = COPY[mode];
  const showSocials = mode !== "forgot";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Maquette : pas de backend
    console.log("submit", { mode, method, remember, ...form });
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
          WeeTalk
        </h1>
        <p className="mt-2 text-xs uppercase tracking-[1.6px] text-brown-sec">
          Talk warmer · Share slower
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
            Back to log in
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
                {m === "login" ? "Log in" : "Sign up"}
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
          {/* Sous-toggle Email | Phone (login / signup, methode email) */}
          {mode !== "forgot" && (
            <div className="flex rounded-[13px] bg-cream p-1">
              {(["email", "phone"] as const).map((mt) => (
                <button
                  key={mt}
                  type="button"
                  onClick={() => setMethod(mt)}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-[10px] py-2 text-sm font-medium transition-all ${
                    method === mt
                      ? "bg-card text-gold shadow-[0_2px_6px_rgba(65,36,2,0.08)]"
                      : "text-brown-sec"
                  }`}
                >
                  {mt === "email" ? (
                    <MailIcon className="size-4" />
                  ) : (
                    <PhoneIcon className="size-4" />
                  )}
                  {mt === "email" ? "Email" : "Phone"}
                </button>
              ))}
            </div>
          )}

          {/* Full name (signup) */}
          {mode === "signup" && (
            <Field
              id="name"
              name="name"
              label="Full name"
              value={form.name}
              onChange={setField("name")}
              placeholder="Jane Doe"
              autoComplete="name"
              icon={<UserIcon />}
            />
          )}

          {/* Email ou Phone */}
          {method === "email" || mode === "forgot" ? (
            <Field
              id="email"
              name="email"
              type="email"
              label="Email"
              value={form.email}
              onChange={setField("email")}
              placeholder="you@example.com"
              autoComplete="email"
              icon={<MailIcon />}
            />
          ) : (
            <Field
              id="phone"
              name="phone"
              type="tel"
              label="Phone"
              value={form.phone}
              onChange={setField("phone")}
              placeholder="+33 6 12 34 56 78"
              autoComplete="tel"
              icon={<PhoneIcon />}
            />
          )}

          {/* Password (login / signup) */}
          {mode !== "forgot" && (
            <Field
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              label="Password"
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
                  aria-label={showPassword ? "Hide password" : "Show password"}
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
                Remember me
              </button>
              <button
                type="button"
                onClick={() => setMode("forgot")}
                className="text-sm font-medium text-gold hover:underline"
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* CTA */}
          <button
            type="submit"
            className="h-[52px] rounded-[14px] bg-gold font-bold text-white shadow-gold transition-all hover:brightness-105 active:scale-[0.98]"
          >
            {copy.cta}
          </button>
        </form>

        {/* Separateur + socials */}
        {showSocials && (
          <>
            <div className="my-5 flex items-center gap-3 text-xs text-brown-sec">
              <span className="h-px flex-1 bg-border" />
              or continue with
              <span className="h-px flex-1 bg-border" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="flex h-[50px] items-center justify-center gap-2 rounded-field border border-border bg-card font-medium text-brown transition-colors hover:bg-cream"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className="flex h-[50px] items-center justify-center gap-2 rounded-field border border-border bg-card font-medium text-brown transition-colors hover:bg-cream"
              >
                <PhoneIcon />
                Phone
              </button>
            </div>
          </>
        )}

        {/* Footer bascule */}
        <p className="mt-6 text-center text-sm text-brown-sec">
          {mode === "login" && (
            <>
              New to WeeTalk?{" "}
              <button
                type="button"
                onClick={() => setMode("signup")}
                className="font-semibold text-gold hover:underline"
              >
                Create an account
              </button>
            </>
          )}
          {mode === "signup" && (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-gold hover:underline"
              >
                Log in
              </button>
            </>
          )}
          {mode === "forgot" && (
            <>
              Remembered it?{" "}
              <button
                type="button"
                onClick={() => setMode("login")}
                className="font-semibold text-gold hover:underline"
              >
                Back to log in
              </button>
            </>
          )}
        </p>
      </div>

      {/* Mention legale */}
      <p className="relative z-10 mt-6 max-w-[416px] text-center text-xs text-brown-sec">
        By continuing you agree to our{" "}
        <a href="#" className="underline hover:text-brown">
          Terms
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-brown">
          Privacy Policy
        </a>
        .
      </p>
    </main>
  );
}
