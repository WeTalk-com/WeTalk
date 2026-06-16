import type { Request, Response } from "express";
import { randomUUID } from "node:crypto";
import bcrypt from "bcryptjs";
import {type CreationOptional, Op, UniqueConstraintError} from "sequelize";
import { z } from "zod";
import { User, type UserRole } from "../models/user.js";
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

function publicUser(user: User) {
	return {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		description: user.description,
		email: user.email,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

// Profil de l'utilisateur authentifié.
export async function me(req: Request, res: Response): Promise<void> {
	const user = await User.findByPk(req.user!.sub);
	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}
	res.json(publicUser(user));
}

export async function getUsers(req: Request, res: Response): Promise<void> {
	const limit = parseInt(req.query.limit as string) || 10;
	const { search, cursor } = req.query;

	const users = await User.findAll({
		limit: limit > 100 ? 100 : limit,
		...(cursor && {
			offset: parseInt(cursor as string) || 0
		}),
		order: [
			["id", "DESC"]
		],
	});
	res.json(users);
}

export async function getUser(req: Request, res: Response): Promise<void> {
	const userId = req.params.uuid;
	if (userId) {
		const user = await User.findByPk(userId);
		if (user)
			res.json(user);
		else
			res.status(404).json({ error: "User not found" });
	} else {
		res.status(404).json({ error: "User ID does not exists" });
	}
}

// Vérification de token pour la gateway / les autres microservices.
export function verify(req: Request, res: Response): void {
	res.json({ valid: true, user: req.user });
}
