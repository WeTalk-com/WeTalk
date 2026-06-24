import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { writeLimiter } from "../middleware/rateLimit.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { idParamSchema, sendMessageBody } from "../schemas/message.schemas.js";
import {
	getConversationList,
	getConversation,
	sendMessage,
	markConversationRead,
	deleteConversation
} from "../controllers/message.controller.js";

export const messageRouter: Router = Router();

/*
Messages
GET    /messages          : Lister les conversations de l'utilisateur connecté
GET    /messages/:id      : Récupérer une conversation entre l'utilisateur connecté et l'id en url
POST   /messages/:id      : Envoyer un message à un utilisateur
PATCH  /messages/:id/read : Marquer comme lus les messages reçus de cet utilisateur
DELETE /messages/:id      : Supprimer la conversation avec cet utilisateur
*/

messageRouter.get("/", requireAuth, getConversationList);
messageRouter.get("/:id", requireAuth, validateParams(idParamSchema), getConversation);
// @ts-expect-error express-rate-limit / Express type mismatch (cf. app.ts)
messageRouter.post("/:id", requireAuth, writeLimiter, validateParams(idParamSchema), validateBody(sendMessageBody), sendMessage);
// @ts-expect-error express-rate-limit / Express type mismatch (cf. app.ts)
messageRouter.patch("/:id/read", requireAuth, writeLimiter, validateParams(idParamSchema), markConversationRead);
// @ts-expect-error express-rate-limit / Express type mismatch (cf. app.ts)
messageRouter.delete("/:id", requireAuth, writeLimiter, validateParams(idParamSchema), deleteConversation);