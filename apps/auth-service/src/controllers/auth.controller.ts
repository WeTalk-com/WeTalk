import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import { Op, UniqueConstraintError } from "sequelize";
import { User, type UserRole } from "../models/user.js";
import {
  registerSchema,
  adminCreateSchema,
  loginSchema,
  refreshSchema,
} from "../schemas/auth.schemas.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import {
  storeRefresh,
  isRefreshValid,
  revokeRefresh,
} from "../utils/refreshStore.js";
import { logger } from "../utils/logger.js";

const SALT_ROUNDS = 12;

function publicUser(user: User) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  };
}

// Émet une paire access/refresh et enregistre le jti du refresh dans l'allowlist Redis.
async function issueTokens(userId: string, role: UserRole) {
  const jti = randomUUID();
  await storeRefresh(userId, jti);
  return {
    accessToken: signAccessToken({ sub: userId, role }),
    refreshToken: signRefreshToken({ sub: userId, role, jti }),
  };
}

type CreateAccountInput = {
  username: string;
  email: string;
  password: string;
  role?: UserRole;
};

// Création d'un compte, mutualisée entre l'inscription publique et la création admin.
// Renvoie l'utilisateur ou un conflit d'unicité ("Email" | "Username").
async function createAccount(
  input: CreateAccountInput,
): Promise<User | { conflict: string }> {
  // Email ET username sont uniques (cf. modèle). On vérifie les deux.
  const existing = await User.findOne({
    where: { [Op.or]: [{ email: input.email }, { username: input.username }] },
  });
  if (existing) {
    return { conflict: existing.email === input.email ? "Email" : "Username" };
  }

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  try {
    return await User.create({
      username: input.username,
      email: input.email,
      passwordHash,
      role: input.role,
    });
  } catch (err) {
    // Garde-fou contre la race condition entre le findOne et le create.
    if (err instanceof UniqueConstraintError) {
      return { conflict: "Email or username" };
    }
    throw err;
  }
}

// Fx1 — inscription publique (rôle "user" forcé par défaut).
export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await createAccount(parsed.data);
  if ("conflict" in result) {
    res.status(409).json({ error: `${result.conflict} already registered` });
    return;
  }

  logger.info("user registered", { userId: result.id, username: result.username });
  res.status(201).json({ user: publicUser(result) });
}

// Fx1 — création de compte par un administrateur, avec rôle au choix.
export async function adminCreateUser(req: Request, res: Response): Promise<void> {
  const parsed = adminCreateSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }

  const result = await createAccount(parsed.data);
  if ("conflict" in result) {
    res.status(409).json({ error: `${result.conflict} already registered` });
    return;
  }

  logger.info("user created by admin", {
    adminId: req.user!.sub,
    userId: result.id,
    role: result.role,
  });
  res.status(201).json({ user: publicUser(result) });
}

// Fx2 — authentification sécurisée.
export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    return;
  }
  const { email, password } = parsed.data;

  const user = await User.findOne({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    logger.warn("login failed", { email });
    res.status(401).json({ error: "Invalid credentials" });
    return;
  }

  const tokens = await issueTokens(user.id, user.role);
  logger.info("login success", { userId: user.id });
  res.json({ user: publicUser(user), ...tokens });
}

// Renouvellement du token d'accès, avec rotation du refresh token.
export async function refresh(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(parsed.data.refreshToken);
  } catch {
    res.status(401).json({ error: "Invalid or expired refresh token" });
    return;
  }

  // Le jti doit être dans l'allowlist : sinon token déjà tourné / révoqué (rejoué).
  if (!(await isRefreshValid(decoded.sub, decoded.jti))) {
    logger.warn("refresh token reuse detected", { userId: decoded.sub, jti: decoded.jti });
    res.status(401).json({ error: "Refresh token revoked or reused" });
    return;
  }

  // Rotation : on invalide l'ancien jti et on émet une nouvelle paire.
  await revokeRefresh(decoded.sub, decoded.jti);
  const tokens = await issueTokens(decoded.sub, decoded.role);
  logger.info("token refreshed", { userId: decoded.sub });
  res.json(tokens);
}

// Déconnexion : révoque le refresh token côté serveur.
export async function logout(req: Request, res: Response): Promise<void> {
  const parsed = refreshSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Validation failed" });
    return;
  }

  try {
    const decoded = verifyRefreshToken(parsed.data.refreshToken);
    await revokeRefresh(decoded.sub, decoded.jti);
    logger.info("logout", { userId: decoded.sub });
  } catch {
    // Token déjà invalide/expiré : logout idempotent, on renvoie 204 quand même.
  }
  res.status(204).send();
}

// Profil de l'utilisateur authentifié.
export async function me(req: Request, res: Response): Promise<void> {
  const user = await User.findByPk(req.user!.sub);
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ user: publicUser(user) });
}

// Vérification de token pour la gateway / les autres microservices.
export function verify(req: Request, res: Response): void {
  res.json({ valid: true, user: req.user });
}
