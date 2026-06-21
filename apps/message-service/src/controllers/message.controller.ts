import type { Request, Response } from "express";
import { Message } from "../models/Message.js";

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

// const axios = require('axios'); // Permet de communiquer avec le microservice PostgreSQL

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
		
		// 2. RÈGLE MÉTIER : Vérification des blocages (Appel inter-service)
		// On imagine que votre microservice User (Postgres) a une route pour vérifier si une relation de blocage existe
		try {
			const checkBlockUrl = `${process.env.USER_SERVICE_URL}/api/users/check-block?userA=${senderId}&userB=${receiverId}`;
			const blockCheck = await axios.get(checkBlockUrl, {
				headers: { Authorization: req.headers.authorization } // On passe le token pour la sécurité
			});
			
			if (blockCheck.data.isBlocked) {
				return res.status(403).json({ error: "Impossible d'envoyer ce message. Vous avez bloqué cet utilisateur ou vous avez été bloqué par lui." });
			}
		} catch (apiError) {
			// Sécurité : Si le service externe est en panne, on trace l'erreur mais on peut décider de bloquer ou laisser passer selon la politique de tolérance aux pannes
			console.error("Impossible de vérifier les blocages :", apiError.message);
		}
		
		// 3. Création et stockage du message dans MongoDB
		const newMessage = await Message.create({
			senderId,
			receiverId,
			content: content.trim()
		});
		
		// 4. Réponse JSON
		res.status(201).json({
			success: true,
			data: newMessage
		});
		
	} catch (error) {
		console.error("Erreur sendMessage:", error);
		res.status(500).json({ error: "Erreur lors de l'envoi du message privé." });
	}
}