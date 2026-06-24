import { z } from "zod";

// Param :id — toujours un UUID (sinon findByPk lève une erreur Postgres -> 500).
export const idParamSchema = z.object({
	id: z.string().uuid({ message: "Invalid user id" }),
});

export const userIdentifierParamSchema = z.object({
	id: z.string().trim().min(3).max(50),
});

// Mise à jour de profil. Tous les champs optionnels (PATCH partiel),
// bornes alignées sur le modèle User (longueurs, URLs).
export const updateMeSchema = z
	.object({
		displayName: z.string().min(3).max(50).nullable(),
		profileImage: z.string().url().max(256).nullable(),
		profileBanner: z.string().url().max(256).nullable(),
		description: z.string().min(1).max(280).nullable(),
	})
	.partial();

export const suspendBodySchema = z.object({
	amount: z.coerce.number().int().min(1),
	unit: z.enum(["minutes", "hours", "days", "months", "years"]),
});

// Query de la liste des utilisateurs : pagination par offset + recherche.
export const listUsersQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	cursor: z.coerce.number().int().min(0).optional(),
	search: z.string().trim().min(1).optional(),
	ids: z.string().trim().min(1).optional(),
	sort: z.enum(["latest"]).optional(),
});

// Query des listes d'abonnements/abonnés.
export const followListQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	cursor: z.coerce.number().int().min(0).optional(),
});
