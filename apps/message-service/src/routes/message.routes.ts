import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateParams } from "../middleware/validate.js";
import { idParamSchema } from "../schemas/message.schemas.js";
import {
	getConversation,
	sendMessage
} from "../controllers/message.controller.js";

export const messageRouter: Router = Router();

/*
Messages
GET    /messages/:id : Récupérer une conversation entre l'utilisateur connecté et l'id en url
POST   /messages/:id : Envoyer un message à un utilisateur.
*/

messageRouter.get("/:id", requireAuth, validateParams(idParamSchema), getConversation);
messageRouter.post("/:id", requireAuth, validateParams(idParamSchema), sendMessage);