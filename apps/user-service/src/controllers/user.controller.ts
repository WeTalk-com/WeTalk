import type { Request, Response } from "express";
import {type CreationOptional, Op} from "sequelize";
import { User, Follow, Mute, Block } from "../models/index.js";

function publicUser(user: User) {
	return {
		id: user.id,
		username: user.username,
		displayName: user.displayName,
		description: user.description,
		// email: user.email,
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
	// TODO: Implémenter la recherche
	// noinspection JSUnusedLocalSymbols
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
	const userId = req.params.id as string;
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

		// Exemple de mise à jour simple
		if (displayName)
			user.displayName = displayName;
		if (profileImage)
			user.profileImage = profileImage;
		if (profileBanner)
			user.profileBanner = profileBanner;
		if (description)
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
		const deleted = await User.destroy({
			where: { id: req.user?.sub }
		});

		if (!deleted) {
			res.status(404).json({ error: "Utilisateur non trouvé." });
			return;
		}

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
		// TODO: Réviser la pagination
		// noinspection JSUnusedLocalSymbols
		const { cursor } = req.query;
		const limit = parseInt(req.query.limit as string, 10) || 10;

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
		// TODO: Réviser la pagination
		// noinspection JSUnusedLocalSymbols
		const { cursor } = req.query;
		const limit = parseInt(req.query.limit as string, 10) || 10;

		const whereConditions = { followingId: req.params.id };

		const followRelations = await Follow.findAll({
			where: whereConditions,
			limit: limit,
			order: [['createdAt', 'DESC'], ['followerId', 'DESC']],
			// On inclut le modèle User lié pour récupérer les infos du compte suivi
			include: [{ model: User, as: 'Followers', attributes: ['id', 'username'] }]
		});

		// @ts-ignore
		res.json({
			data: followRelations.map(f => {
				// @ts-ignore
				return f.Followers;
			})
		});
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la récupération des abonnements." });
	}
}

export async function blockList(req: Request, res: Response): Promise<void> {
	try {
		const blocks = await Block.findAll({
			where: { blockerId: req.user?.sub },
			include: [{ model: User, as: 'BlockedUser', attributes: ['id', 'username'] }]
		});
		res.json({ data: blocks.map(b => {
				// @ts-ignore
				return b.BlockedUser;
			})
		});
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de la récupération." });
	}
}

export async function block(req: Request, res: Response): Promise<void> {
	try {
		const targetId = req.params.id as string;
		const myId = req.user?.sub as string;

		if (targetId === myId) {
			res.status(400).json({ error: "Action impossible." });
			return;
		}

		const targetUser = await User.findByPk(targetId);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		// Règle métier Twitter : Bloquer quelqu'un force le désabonnement mutuel automatique
		await Follow.destroy({
			where: {
				[Op.or]: [
					{ followerId: myId, followingId: targetId },
					{ followerId: targetId, followingId: myId }
				]
			}
		});

		await Block.findOrCreate({ where: { blockerId: myId, blockedId: targetId } });

		res.json({ message: "Utilisateur bloqué." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du blocage." });
	}
}

export async function unblock(req: Request, res: Response): Promise<void> {
	try {
		await Block.destroy({ where: { blockerId: req.user?.sub, blockedId: req.params.id } });
		res.json({ message: "Utilisateur débloqué." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du déblocage." });
	}
}

export async function mute(req: Request, res: Response): Promise<void> {
	try {
		const targetId = req.params.id as string;
		const myId = req.user?.sub as string;

		if (targetId === myId) {
			res.status(400).json({ error: "Action impossible." });
			return;
		}

		const targetUser = await User.findByPk(targetId);
		if (!targetUser) {
			res.status(404).json({ error: "Utilisateur cible introuvable." });
			return;
		}

		await Mute.findOrCreate({ where: { muterId: myId, mutedId: targetId } });
		res.json({ message: "Utilisateur masqué." });
	} catch (error) {
		res.status(500).json({ error: "Erreur lors du masquage." });
	}
}

export async function unmute(req: Request, res: Response): Promise<void> {
	try {
		await Mute.destroy({ where: { muterId: req.user?.sub, mutedId: req.params.id } });
		res.json({ message: "L'utilisateur n'est plus masqué." });
	} catch (error) {
		res.status(500).json({ error: "Erreur." });
	}
}
