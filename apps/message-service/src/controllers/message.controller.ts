import type { Request, Response } from "express";
import { Message } from "../models/Message.js";
import { env } from "../config/env.js";
import axios from "axios";

export async function getConversation(req: Request, res: Response) {
	try {
		const myId = req.user!.sub as string;
		const targetId = req.params.id as string;
		const cursor = req.query.cursor as string; // Le curseur sera un timestamp ISO string (createdAt)
		const limit = parseInt(req.query.limit as string, 10) || 20;
		
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
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (_) {
		res.status(500).json({ error: "Erreur lors de la récupération des messages." });
	}
}

export async function sendMessage(req: Request, res: Response){
	try {
		const { receiverId, content } = req.body;
		const senderId = req.user!.sub as string; // L'UUID de l'expéditeur extrait du token JWT
		
		if (!receiverId || !content || content.trim() === "") {
			return res.status(400).json({ error: "Le destinataire et le contenu du message sont requis." });
		}
		
		if (senderId === receiverId) {
			return res.status(400).json({ error: "Vous ne pouvez pas vous envoyer un message à vous-même." });
		}
		
		try {
			const results = await Promise.allSettled([
				axios.get(`${env.userServiceUrl}/users/${senderId}/status`),
				axios.get(`${env.userServiceUrl}/users/${receiverId}/status`)
			]);
			
			// @ts-expect-error Unrecognized schema
			if (!results[0].value.data.isAvailable) {
				return res.status(403).json({ error: "Impossible d'envoyer ce message car vous avez été suspendu ou banni." });
			}
			
			// @ts-expect-error Unrecognized schema
			if (!results[1].value.data.isAvailable) {
				return res.status(403).json({ error: "Impossible d'envoyer ce message car votre destinataire à été suspendu ou banni." });
			}
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (apiError) {
			// TODO: À voir ce qu'on fait ici. Autoriser l'envoi de message malgré la panne du service/échec de la requête, ou bloquer tout.
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
		
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (error) {
		res.status(500).json({ error: "Erreur lors de l'envoi du message privé." });
	}
}