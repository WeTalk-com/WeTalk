import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { loginLimiter, registerLimiter } from "../middleware/rateLimit.js";
import {
    register,
    adminCreateUser,
    login,
    refresh,
    logout,
    me,
	getUsers,
	getUser,
} from "../controllers/user.controller.js";

export const userRouter = Router();

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
userRouter.get("/:uuid", getUser);
userRouter.put("/me", requireAuth, updateMe);
userRouter.delete("/me", requireAuth, deleteMe);

// Abonnements
userRouter.get("/:uuid/following", getFollowing);
userRouter.get("/:uuid/followers", getFollowers);
userRouter.post("/:uuid/follow", requireAuth, follow);
userRouter.delete("/:uuid/follow", requireAuth, unfollow);

// Modération
userRouter.get("/me/blocks", requireAuth, blockList);
userRouter.post("/:uuid/block", requireAuth, block);
userRouter.delete("/:uuid/block", requireAuth, unblock);
userRouter.post("/:uuid/mute", requireAuth, mute);
userRouter.delete("/:uuid/mute", requireAuth, unmute);