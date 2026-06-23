import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { validateBody, validateParams } from "../middleware/validate.js";
import { idParamSchema, sendMessageBody } from "../schemas/message.schemas.js";
import {
	getConversationList,
	getConversation,
	sendMessage,
	deleteConversation
} from "../controllers/message.controller.js";

export const messageRouter: Router = Router();

/*
Messages
GET    /messages/:id : Récupérer une conversation entre l'utilisateur connecté et l'id en url
POST   /messages/:id : Envoyer un message à un utilisateur.
*/

messageRouter.get("/", requireAuth, getConversationList);
messageRouter.get("/:id", requireAuth, validateParams(idParamSchema), getConversation);
messageRouter.post("/:id", requireAuth, validateParams(idParamSchema), validateBody(sendMessageBody), sendMessage);
messageRouter.delete("/:id", requireAuth, validateParams(idParamSchema), deleteConversation);