import type { Request, Response } from "express";
import { Op, type WhereOptions } from "sequelize";
import { User, Follow } from "../models/index.js";
import type { UserRole } from "../models/user.js";
import { markAccessBanned, clearAccessBanned } from "../utils/banStore.js";
import { revokeAllRefresh } from "../utils/refreshStore.js";
import {
	listUsersQuerySchema,
	followListQuerySchema,
	suspendBodySchema,
} from "../schemas/user.schemas.js";

// Détecte un UUID v1-v5 pour distinguer lookup par id vs par username.
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Échappe les jokers LIKE (\ % _) pour qu'un terme de recherche soit traité
// littéralement et ne permette pas à l'utilisateur d'injecter des wildcards.
function escapeLike(term: string): string {
	return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

// Suspension active = date future. On normalise les dates passées à "non suspendu".
function isSuspended(user: User): boolean {
	return user.suspendedUntil != null && user.suspendedUntil.getTime() > Date.now();
}

// Calcule la date de fin de suspension à partir de maintenant + (montant, unité).
function computeSuspendedUntil(amount: number, unit: string): Date {
	const until = new Date();
	switch (unit) {
		case "minutes":
			until.setMinutes(until.getMinutes() + amount);
			break;
		case "hours":
			until.setHours(until.getHours() + amount);
			break;
		case "days":
			until.setDate(until.getDate() + amount);
			break;
		case "months":
			until.setMonth(until.getMonth() + amount);
			break;
		case "years":
			until.setFullYear(until.getFullYear() + amount);
			break;
	}
	return until;
}

function canSeeModeration(
	viewer: { sub: string; role: UserRole } | undefined,
	targetId: string,
): boolean {
	if (!viewer) return false;
	return viewer.role === "moderator" || viewer.role === "admin" || viewer.sub === targetId;
}

function publicUser(user: User, includeModeration = false) {
	const base = {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		description: user.description,
		profileImage: user.profileImage,
		profileBanner: user.profileBanner,
		// email: user.email,
		role: user.role,
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
	if (!includeModeration) return base;
	return {
		...base,
		isBanned: user.isBanned,
		isSuspended: isSuspended(user),
		suspendedUntil: isSuspended(user) ? user.suspendedUntil : null,
	};
}

// Profil de l'utilisateur authentifié.
export async function me(req: Request, res: Response): Promise<void> {
	const user = await User.findByPk(req.user!.sub);
	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}
	res.json(publicUser(user, true));
}

export async function getUsers(req: Request, res: Response): Promise<void> {
	const parsed = listUsersQuerySchema.safeParse(req.query);
	if (!parsed.success) {
		res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
		return;
	}
	const { limit, cursor, search } = parsed.data;

	// Recherche (Fx13) : match partiel insensible à la casse sur username + displayName.
	let where: WhereOptions | undefined;
	if (search) {
		const pattern = `%${escapeLike(search)}%`;
		where = {
			[Op.or]: [
				{ username: { [Op.iLike]: pattern } },
				{ displayName: { [Op.iLike]: pattern } },
			],
		};
	}

	const users = await User.findAll({
		...(where && { where }),
		limit,
		...(cursor !== undefined && { offset: cursor }),
		order: [
			["id", "DESC"]
		],
	});
	const showModeration = req.user?.role === "moderator" || req.user?.role === "admin";
	res.json(users.map((u) => publicUser(u, showModeration)));
}

export async function getUser(req: Request, res: Response): Promise<void> {
	const identifier = req.params.id as string;

	// Lookup par UUID si l'identifiant en est un, sinon par username.
	const user = UUID_RE.test(identifier)
		? await User.findByPk(identifier)
		: await User.findOne({ where: { username: identifier } });

	if (!user) {
		res.status(404).json({ error: "User not found" });
		return;
	}
	res.json(publicUser(user, canSeeModeration(req.user, user.id)));
}

// export async function updateMe(req: Request, res: Response): Promise<void> {}

export async function updateMe(req: Request, res: Response): Promise<void> {
	try {
		// TODO: Est-ce que l'on permet de changer le nom d'utilisateur (handle) ?
		const { displayName, profileImage, profileBanner, description } = req.body; // Ajoutez ici d'autres champs comme la 'bio' si nécessaire

		const user = await User.findByPk(req.user?.sub);
		if (!user) {
			res.status(404).json({ error: "Utilisateur non trouvé." });
			return;
		}

		// Champ absent = inchangé ; null = vidé ; valeur = mis à jour.
		if (displayName !== undefined)
			user.displayName = displayName;
		if (profileImage !== undefined)
			user.profileImage = profileImage;
		if (profileBanner !== undefined)
			user.profileBanner = profileBanner;
		if (description !== undefined)
			user.description = description;

		await user.save();

		res.json({ message: "Profil mis à jour avec succès.", data: { id: user.id, username: user.username } });
	} catch (error: any) {
		if (error.name === 'SequelizeUniqueConstraintError') {
			res.status(400).json({ error: "Ce nom d'utilisateur est déjà pris." });
			return;
		}
		res.status(500).json({ error: "Erreur lors de la mise à jour." });
	}
}

export async function deleteMe(req: Request, res: Response): Promise<void> {
	try {
		const myId = req.user?.sub as string;
		const deleted = await User.destroy({
			where: { id: myId }
		});

		if (!deleted) {
			res.status(404).json({ error: "Utilisateur non trouvé." });
			return;
		}

		// Le compte est supprimé mais son access token reste valide jusqu'à expiration. Donc on le révoque immédiatement
		await markAccessBanned(myId);
		await revokeAllRefresh(myId);

		res.json({ message: "Compte supprimé avec succès." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la suppression du compte." });
	}
}

export async function follow(req: Request, res: Response): Promise<void> {
	try {
		const targetId = req.params.id as string;
		const myId = req.user?.sub as string;

		if (targetId === myId) {
			res.status(400).json({ error: "Vous ne pouvez pas vous abonner à vous-même." });
			return;
		}

		const targetUser = await User.findByPk(targetId);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		const [_, created] = await Follow.findOrCreate({
			where: { followerId: myId, followingId: targetId }
		});

		if (!created) {
			res.status(400).json({ error: "Vous suivez déjà cet utilisateur." });
			return;
		}

		res.status(201).json({ message: "Vous vous êtes abonné avec succès." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de l'abonnement." });
	}
}

export async function unfollow(req: Request, res: Response): Promise<void> {
	try {
		const destroyed = await Follow.destroy({
			where: { followerId: req.user?.sub, followingId: req.params.id }
		});

		if (!destroyed) {
			res.status(400).json({ error: "Vous ne suiviez pas cet utilisateur." });
			return;
		}

		res.json({ message: "Vous vous êtes désabonné avec succès." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du désabonnement." });
	}
}

export async function getFollowing(req: Request, res: Response): Promise<void> {
	try {
		const parsed = followListQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
			return;
		}
		// TODO: Réviser la pagination (parsed.data.cursor)
		const { limit } = parsed.data;

		const whereConditions = { followerId: req.params.id };

		const followRelations = await Follow.findAll({
			where: whereConditions,
			limit: limit,
			order: [['createdAt', 'DESC'], ['followingId', 'DESC']],
			// On inclut le modèle User lié pour récupérer les infos du compte suivi
			include: [{ model: User, as: 'Following', attributes: ['id', 'username'] }]
		});

		res.json({
			data: followRelations.map(f => {
				// @ts-ignore
				return f.Following;
			})
		});
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la récupération des abonnements." });
	}
}

export async function getFollowers(req: Request, res: Response): Promise<void> {
	try {
		const parsed = followListQuerySchema.safeParse(req.query);
		if (!parsed.success) {
			res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
			return;
		}
		// TODO: Réviser la pagination (parsed.data.cursor)
		const { limit } = parsed.data;

		const whereConditions = { followingId: req.params.id };

		const followRelations = await Follow.findAll({
			where: whereConditions,
			limit: limit,
			order: [['createdAt', 'DESC'], ['followerId', 'DESC']],
			// On inclut le User abonné (followerId) pour récupérer ses infos
			include: [{ model: User, as: 'Follower', attributes: ['id', 'username'] }]
		});

		res.json({
			data: followRelations.map(f => {
				// @ts-ignore
				return f.Follower;
			})
		});
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la récupération des abonnements." });
	}
}

// Fx21 — bannissement par un modérateur/admin. Un utilisateur banni ne peut
// plus se connecter (vérifié dans auth-service au login et au refresh).
export async function banUser(req: Request, res: Response): Promise<void> {
	try {
		const targetId = req.params.id as string;
		const myId = req.user?.sub as string;

		if (targetId === myId) {
			res.status(400).json({ error: "Vous ne pouvez pas vous bannir vous-même." });
			return;
		}

		const targetUser = await User.findByPk(targetId);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		// On protège les admins : un modérateur ne peut pas bannir un admin.
		if (targetUser.role === "admin") {
			res.status(403).json({ error: "Impossible de bannir un administrateur." });
			return;
		}

		targetUser.isBanned = true;
		await targetUser.save();
		// Révoque immédiatement les access tokens encore valides de l'utilisateur.
		await markAccessBanned(targetId);

		res.json({ message: "Utilisateur banni." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du bannissement." });
	}
}

export async function unbanUser(req: Request, res: Response): Promise<void> {
	try {
		const targetUser = await User.findByPk(req.params.id as string);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		targetUser.isBanned = false;
		await targetUser.save();
		await clearAccessBanned(targetUser.id);

		res.json({ message: "Utilisateur débanni." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du débannissement." });
	}
}

// Fx21 — suspension par un modérateur/admin : l'utilisateur ne peut plus
// envoyer de posts jusqu'à suspendedUntil (vérifié par post-service à la création).
export async function suspendUser(req: Request, res: Response): Promise<void> {
	try {
		const targetId = req.params.id as string;
		const myId = req.user?.sub as string;

		if (targetId === myId) {
			res.status(400).json({ error: "Vous ne pouvez pas vous suspendre vous-même." });
			return;
		}

		const parsed = suspendBodySchema.safeParse(req.body);
		if (!parsed.success) {
			res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
			return;
		}

		const targetUser = await User.findByPk(targetId);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		// On protège les admins : un modérateur ne peut pas suspendre un admin.
		if (targetUser.role === "admin") {
			res.status(403).json({ error: "Impossible de suspendre un administrateur." });
			return;
		}

		targetUser.suspendedUntil = computeSuspendedUntil(parsed.data.amount, parsed.data.unit);
		await targetUser.save();

		res.json({ message: "Utilisateur suspendu.", suspendedUntil: targetUser.suspendedUntil });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la suspension." });
	}
}

export async function unsuspendUser(req: Request, res: Response): Promise<void> {
	try {
		const targetUser = await User.findByPk(req.params.id as string);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		targetUser.suspendedUntil = null;
		await targetUser.save();

		res.json({ message: "Suspension levée." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la levée de suspension." });
	}
}
