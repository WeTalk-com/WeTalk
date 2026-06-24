import { createApp } from "./app.js";
import { connectDb, mongoose } from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import http from "http";
import { Server, type Socket } from "socket.io";
import { Message } from "./models/Message.js";
import { socketRequireAuth } from "./middleware/auth.js";

async function main(): Promise<void> {
	await connectDb();
	logger.info("connected to MongoDB");
	
	await connectRedis();
	logger.info("connected to Redis");
	
	const app = createApp();
	// const server = app.listen(env.port, () => {
	// 	logger.info("message-service listening", { port: env.port, env: env.nodeEnv });
	// });

	// 1. Création du serveur HTTP natif Node.js à partir d'Express
	const server = http.createServer(app);

	// 2. Initialisation de Socket.io sur ce serveur
	const io = new Server(server, {
		path: "/socket.io",
		cors: {
			origin: env.corsOrigins.length > 0 ? env.corsOrigins : false,
			methods: ["GET", "POST", "DELETE"],
			credentials: true
		}
	});
	
	io.use(socketRequireAuth());
	
	// 3. Gestion des connexions WebSockets
	io.on("connection", (socket) => {
		// L'identité vient TOUJOURS du token vérifié (socketRequireAuth), jamais du client.
		const senderId = socket.user?.sub;
		if (!senderId) {
			socket.disconnect(true);
			return;
		}

		logger.info(`Un utilisateur s'est connecté : ${socket.id} (${senderId})`);

		// L'utilisateur rejoint automatiquement sa propre room privée (= son UUID).
		// Aucun paramètre client : on ne peut pas rejoindre la room d'autrui.
		socket.join(senderId);
		logger.info(`Utilisateur ${senderId} a rejoint sa room privée.`);

		// Écouter quand un utilisateur envoie un message privé
		socket.on("send_private_message", async (data) => {
			const receiverId = data?.receiverId as string | undefined;
			const content = typeof data?.content === "string" ? data.content.trim() : "";

			if (!receiverId || !content) {
				socket.emit("message_error", { error: "Destinataire et contenu requis" });
				return;
			}
			if (content.length > 1000) {
				socket.emit("message_error", { error: "Message trop long" });
				return;
			}
			if (receiverId === senderId) {
				socket.emit("message_error", { error: "Vous ne pouvez pas vous envoyer un message à vous-même" });
				return;
			}

			try {
				// 1. Sauvegarde instantanée dans MongoDB
				const newMessage = await Message.create({
					senderId,
					receiverId,
					content
				});

				// 2. Émission en TEMPS RÉEL au destinataire (s'il est en ligne)
				// On cible uniquement la room qui porte l'UUID du destinataire
				io.to(receiverId).emit("receive_private_message", newMessage);

				// 3. Confirmation à l'expéditeur
				// (utile pour accuser réception ou synchroniser plusieurs onglets ouverts)
				socket.emit("message_sent_success", newMessage);

			} catch (error) {
				logger.error("Erreur WebSocket Message : " + String(error), );
				socket.emit("message_error", { error: "Impossible d'envoyer le message" });
			}
		});

		// Gestion de la déconnexion
		socket.on("disconnect", () => {
			logger.info(`Utilisateur déconnecté : ${socket.id}`);
		});
	});

	server.listen(env.port, () => {
		logger.info("message-service listening", { port: env.port, env: env.nodeEnv });
	});
	
	// Arrêt propre : ferme le serveur HTTP puis les connexions DB/Redis.
	async function shutdown(signal: string): Promise<void> {
		logger.info("shutting down", { signal });
		await new Promise<void>((resolve, reject) => {
			server.close((err) => (err ? reject(err) : resolve()));
		});
		await Promise.allSettled([mongoose.disconnect(), redis.quit()]);
		process.exit(0);
	}
	
	process.on("SIGTERM", () => void shutdown("SIGTERM"));
	process.on("SIGINT", () => void shutdown("SIGINT"));
}

main().catch((err) => {
	logger.error("failed to start message-service", {
		error: err instanceof Error ? err.message : String(err),
		// error: JSON.stringify(err),
	});
	process.exit(1);
});
