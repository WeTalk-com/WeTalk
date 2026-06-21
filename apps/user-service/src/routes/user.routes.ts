import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
    me,
	getUsers,
	getUser,
	updateMe,
	deleteMe,
	getFollowing,
	getFollowers,
	follow,
	unfollow,
	blockList,
	block,
	unblock,
	mute,
	unmute,
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

Modération & Confidentialité
POST   /users/:id/block : Bloquer un utilisateur.
DELETE /users/:id/block : Débloquer un utilisateur.
GET    /users/me/blocks : Liste de ses propres utilisateurs bloqués.
POST   /users/:id/mute : Masquer un utilisateur.
DELETE /users/:id/mute : Ne plus masquer un utilisateur.
 */

// Profils
userRouter.get("/", getUsers);
userRouter.get("/me", requireAuth, me);
userRouter.get("/:id", getUser);
userRouter.put("/me", requireAuth, updateMe);
userRouter.delete("/me", requireAuth, deleteMe);

// Abonnements
userRouter.get("/:id/following", getFollowing);
userRouter.get("/:id/followers", getFollowers);
userRouter.post("/:id/follow", requireAuth, follow);
userRouter.delete("/:id/follow", requireAuth, unfollow);

// Modération
userRouter.get("/me/blocks", requireAuth, blockList);
userRouter.post("/:id/block", requireAuth, block);
userRouter.delete("/:id/block", requireAuth, unblock);
userRouter.post("/:id/mute", requireAuth, mute);
userRouter.delete("/:id/mute", requireAuth, unmute);