import { apiFetch } from "./client";

// Auth via cookie httpOnly : le token est pose/lu par le navigateur, jamais expose au JS.
export type AuthUser = {
  id: string;
  username: string;
  email: string;
  role: "user" | "moderator" | "admin";
};

export function login(email: string, password: string): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  }).then((r) => r.user);
}

export function register(
  username: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  }).then((r) => r.user);
}

export function logout(): Promise<unknown> {
  return apiFetch("/auth/logout", { method: "POST" });
}

export function me(): Promise<AuthUser> {
  return apiFetch<{ user: AuthUser }>("/auth/me").then((r) => r.user);
}
