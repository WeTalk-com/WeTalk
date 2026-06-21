import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { idParamSchema, userIdentifierParamSchema, updateMeSchema } from "../schemas/user.schemas.js";
import {
	me,
	getUsers,
	getUser,
	updateMe,
	deleteMe,
	getFollowing,
	getFollowers,
	followingIds,
	follow,
	unfollow,
	banUser,
	unbanUser,
	suspendUser,
	unsuspendUser,
	isUserAvailable,
} from "../controllers/user.controller.js";

export const userRouter: Router = Router();

/*
Profils
GET    /users?search=query : Rechercher des utilisateurs (barre de recherche).
GET    /users/:id_ou_username : Récupérer les informations publiques d'un profil.
PATCH  /users/me : Modifier son propre profil (bio, avatar, bannière).
DELETE /users/me : Supprimer ou désactiver son compte.

Abonnements (Graphe Social)
POST   /users/:id/follow : S'abonner à un utilisateur.
DELETE /users/:id/follow : Se désabonner d'un utilisateur.
GET    /users/:id/following : Liste des abonnements de l'utilisateur (qui il suit).
GET    /users/:id/followers : Liste des abonnés de l'utilisateur (qui le suit).

Modération (modérateur/admin uniquement)
POST   /users/:id/ban : Bannir un utilisateur (il ne peut plus se connecter).
DELETE /users/:id/ban : Lever le bannissement.
POST   /users/:id/suspend : Suspendre l'envoi de posts (body: { amount, unit }).
DELETE /users/:id/suspend : Lever la suspension.
 */

// Profils
userRouter.get("/", requireAuth, getUsers);
userRouter.get("/me", requireAuth, me);
userRouter.get("/:id", requireAuth, validateParams(userIdentifierParamSchema), getUser);
userRouter.get("/:id/status", validateParams(userIdentifierParamSchema), isUserAvailable);
userRouter.patch("/me", requireAuth, writeLimiter, validateBody(updateMeSchema), updateMe);
userRouter.delete("/me", requireAuth, writeLimiter, deleteMe);

// Abonnements
userRouter.get("/:id/following", requireAuth, validateParams(idParamSchema), getFollowing);
userRouter.get("/:id/following/ids", requireAuth, validateParams(idParamSchema), followingIds);
userRouter.get("/:id/followers", requireAuth, validateParams(idParamSchema), getFollowers);
userRouter.post("/:id/follow", requireAuth, writeLimiter, validateParams(idParamSchema), follow);
userRouter.delete("/:id/follow", requireAuth, writeLimiter, validateParams(idParamSchema), unfollow);

// Modération (modérateur/admin uniquement)
userRouter.post("/:id/ban", requireAuth, requireRole("moderator", "admin"), writeLimiter, validateParams(idParamSchema), banUser);
userRouter.delete("/:id/ban", requireAuth, requireRole("moderator", "admin"), writeLimiter, validateParams(idParamSchema), unbanUser);
userRouter.post("/:id/suspend", requireAuth, requireRole("moderator", "admin"), writeLimiter, validateParams(idParamSchema), suspendUser);
userRouter.delete("/:id/suspend", requireAuth, requireRole("moderator", "admin"), writeLimiter, validateParams(idParamSchema), unsuspendUser);