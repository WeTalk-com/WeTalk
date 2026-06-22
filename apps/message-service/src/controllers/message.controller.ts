import type { Request, Response } from "express";
import { Message } from "../models/Message.js";
import { env } from "../config/env.js";
import axios from "axios";
import {logger} from "../utils/logger.js";

export async function getConversationList(req: Request, res: Response) {
	try {
		const myId = req.user!.sub as string;
		// const limit = parseInt(req.query.limit as string, 10);

		const queryConditions: { $or: Array<object> } = {
			$or: [
				{ senderId: myId },
				{ receiverId: myId }
			]
		};

		const conversations = await Message.find(queryConditions)
			.sort({ createdAt: -1 });
			// .limit(limit);

		res.json({
			data: [...new Set(conversations.map(o => o.receiverId))],
		});
	} catch (e) {
		logger.error((e as Error).message);
		res.status(500).json({ error: "Erreur lors de la récupération de la liste des conversations." });
	}
}

export async function getConversation(req: Request, res: Response) {
	try {
		const myId = req.user!.sub as string;
		const targetId = req.params.id as string;
		const cursor = req.query.cursor as string; // Le curseur sera un timestamp ISO string (createdAt)
		let limit = parseInt(req.query.limit as string, 10) || 20;

		if (limit < 1) {
			limit = 1;
		}
		if (limit > 50) {
			limit = 50;
		}

		const queryConditions: { $or: Array<object>, createdAt?: object } = {
			$or: [
				{ senderId: myId, receiverId: targetId },
				{ senderId: targetId, receiverId: myId }
			]
		};
		
		if (cursor) {
			queryConditions.createdAt = { $lt: new Date(cursor) };
		}
		
		const messages = await Message.find(queryConditions)
			.sort({ createdAt: -1 }) // Du plus récent au plus ancien
			.limit(limit);
		
		// @ts-expect-error Object messages possibly undefined
		const nextCursor = messages.length > 0 ? messages[messages.length - 1].createdAt : null;
		
		res.json({
			data: messages,
			pagination: {
				nextCursor,
				hasNextPage: messages.length === limit
			}
		});
	} catch (e) {
		logger.error((e as Error).message);
		res.status(500).json({ error: "Erreur lors de la récupération des messages." });
	}
}

export async function sendMessage(req: Request, res: Response){
	try {
		const receiverId = req.params.id as string;
		const { content } = req.body;
		const senderId = req.user!.sub as string; // L'UUID de l'expéditeur extrait du token JWT
		
		if (!receiverId || !content || content.trim() === "") {
			return res.status(400).json({ error: "Le destinataire et le contenu du message sont requis." });
		}
		
		if (senderId === receiverId) {
			return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même." });
		}
		
		try {
			
			const results = await Promise.allSettled([
				axios.get(`${env.userServiceUrl}/users/${senderId}/status`, {
					// @ts-expect-error Conflicting sources
					headers: { Authorization: req.headers.authorization }
				}),
				axios.get(`${env.userServiceUrl}/users/${receiverId}/status`, {
					// @ts-expect-error Conflicting sources
					headers: { Authorization: req.headers.authorization }
				})
			]);
			
			if (results[0].status !== "fulfilled" || !results[0].value.data.isAvailable) {
				return res.status(403).json({ error: "Impossible d'envoyer ce message car vous avez été suspendu ou banni." });
			}
			
			if (results[1].status !== "fulfilled" || !results[1].value.data.isAvailable) {
				return res.status(403).json({ error: "Impossible d'envoyer ce message car votre destinataire à été suspendu ou banni." });
			}
		} catch (apiError) {
			logger.error((apiError as Error).message);
			return res.status(504).json({ error: "Impossible de contacter le user-service." });
		}
		
		const newMessage = await Message.create({
			senderId,
			receiverId,
			content: content.trim()
		});
		
		res.status(201).json({
			success: true,
			data: newMessage
		});
	} catch (e) {
		logger.error((e as Error).message);
		res.status(500).json({ error: "Erreur lors de l'envoi du message privé." });
	}
}

export async function deleteConversation(req: Request, res: Response) {
	try {
		const myId = req.user!.sub as string;
		const targetId = req.params.id as string;

		if (myId === targetId) {
			return res.status(403).json({ error: "Vous ne pouvez pas supprimer une conversation qui n'existe pas." });
		}

		await Message.deleteMany({
			senderId: myId,
			receiverId: targetId,
		});

		res.json({ message: "Conversation supprimée." });
	} catch (e) {
		logger.error((e as Error).message);
		res.status(500).json({ error: "Erreur lors de suppression de la conversation." });
	}
}