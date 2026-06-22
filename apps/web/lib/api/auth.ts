import { apiFetch, ApiError } from "./client";

export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
};

export type AuthErrorCode =
  | "invalid_credentials"
  | "username_taken"
  | "email_taken"
  | "password_too_short"
  | "unknown";

export class AuthError extends Error {
  constructor(public readonly code: AuthErrorCode) {
    super(code);
  }
}

function mapRegisterError(err: unknown): never {
  if (err instanceof ApiError) {
    const msg = String((err.body as { error?: string }).error ?? "").toLowerCase();
    if (err.status === 409) {
      if (msg.includes("username")) throw new AuthError("username_taken");
      if (msg.includes("email")) throw new AuthError("email_taken");
    }
    if (err.status === 400) {
      const fields = (err.body as { details?: { fieldErrors?: { password?: string[] } } })
        .details?.fieldErrors?.password;
      if (fields?.some((e) => e.toLowerCase().includes("least"))) {
        throw new AuthError("password_too_short");
      }
    }
  }
  throw new AuthError("unknown");
}

function mapLoginError(err: unknown): never {
  if (err instanceof ApiError && err.status === 401) {
    throw new AuthError("invalid_credentials");
  }
  throw new AuthError("unknown");
}

export function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  })
    .then((r) => r.user)
    .catch(mapRegisterError);
}

export function login(email: string, password: string): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
    .then((r) => r.user)
    .catch(mapLoginError);
}

export function logout(): Promise<unknown> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function me(): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/me").then((r) => r.user);
}
