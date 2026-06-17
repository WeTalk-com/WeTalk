"use client";

import { useState, type ReactNode } from "react";

/* ------------------------------------------------------------------ */
/* Icones SVG inline (stroke-based, strokeWidth ~1.9, rounded caps)    */
/* ------------------------------------------------------------------ */

type IconProps = { className?: string };

const baseIcon = (className = "size-[18px]") => ({
  className,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
});

const MailIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);

const PhoneIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <rect x="6" y="2" width="12" height="20" rx="3" />
    <path d="M11 18h2" />
  </svg>
);

const LockIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </svg>
);

const UserIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21a8 8 0 0 1 16 0" />
  </svg>
);

const EyeIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M9.9 5.2A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a17 17 0 0 1-3.2 4M6.6 6.6A17 17 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 4.1-.8" />
    <path d="m9.9 9.9a3 3 0 0 0 4.2 4.2" />
    <path d="m2 2 20 20" />
  </svg>
);

const CheckIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="m20 6-11 11-5-5" />
  </svg>
);

const ArrowLeftIcon = ({ className }: IconProps) => (
  <svg {...baseIcon(className)}>
    <path d="M19 12H5" />
    <path d="m12 19-7-7 7-7" />
  </svg>
);

const GoogleIcon = ({ className }: IconProps) => (
  <svg className={className ?? "size-[18px]"} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
    />
  </svg>
);

/* ------------------------------------------------------------------ */
/* Champ reutilisable                                                  */
/* ------------------------------------------------------------------ */

type FieldProps = {
  id: string;
  label: string;
  type?: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon: ReactNode;
  trailing?: ReactNode;
};

function Field({
  id,
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  autoComplete,
  icon,
  trailing,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-[13px] font-medium text-brown-sec"
      >
        {label}
      </label>
      <div className="group flex h-[50px] items-center gap-2.5 rounded-field border-[1.5px] border-border bg-cream px-3.5 transition-all duration-150 focus-within:border-gold focus-within:bg-white focus-within:shadow-[0_0_0_3px_rgba(186,117,23,0.14)]">
        <span className="shrink-0 text-placeholder transition-colors group-focus-within:text-gold">
          {icon}
        </span>
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full bg-transparent text-[15px] text-brown outline-none placeholder:text-placeholder"
        />
        {trailing}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

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
      <div className="relative z-10 w-full max-w-[416px] rounded-card border border-border bg-white p-[30px] shadow-[0_24px_60px_rgba(65,36,2,0.10)]">
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
                    ? "bg-white text-brown shadow-[0_2px_6px_rgba(65,36,2,0.08)]"
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
                      ? "bg-white text-gold shadow-[0_2px_6px_rgba(65,36,2,0.08)]"
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
                  aria-label={
                    showPassword
                      ? "Masquer le mot de passe"
                      : "Afficher le mot de passe"
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
                      : "border-border bg-white"
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
            className="h-[52px] rounded-[14px] bg-gold font-bold text-white shadow-[0_8px_20px_rgba(186,117,23,0.32)] transition-all hover:brightness-105 active:scale-[0.98]"
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
                className="flex h-[50px] items-center justify-center gap-2 rounded-field border border-border bg-white font-medium text-brown transition-colors hover:bg-cream"
              >
                <GoogleIcon />
                Google
              </button>
              <button
                type="button"
                onClick={() => setMethod("phone")}
                className="flex h-[50px] items-center justify-center gap-2 rounded-field border border-border bg-white font-medium text-brown transition-colors hover:bg-cream"
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
