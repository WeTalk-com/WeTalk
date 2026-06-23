import { createApp } from "./app.js";
import { connectDb, mongoose } from "./config/db.js";
import { connectRedis, redis } from "./config/redis.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import http from "http";
import { Server } from "socket.io";
import { Message } from "./models/Message.js";

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

	// 3. Gestion des connexions WebSockets
	io.on("connection", (socket) => {
		logger.info(`Un utilisateur s'est connecté : ${socket.id}`);

		// Étape A : L'utilisateur s'identifie et rejoint sa propre "room" privée
		socket.on("join_private_room", (userId) => {
			socket.join(userId);
			logger.info(`Utilisateur ${userId} a rejoint sa room privée.`);
		});
		
		// Test connexion
		socket.emit("server-ready", { ok: true });
		socket.on("ping", (payload, ack) => {
			console.log("ping reçu:", payload);
			if (ack)
				ack({ ok: true, received: payload });
		});

		// Étape B : Écouter quand un utilisateur envoie un message privé
		socket.on("send_private_message", async (data) => {
			const { senderId, receiverId, content } = data;

			try {
				// 1. Sauvegarde instantanée dans MongoDB en tâche de fond
				const newMessage = await Message.create({
					senderId,
					receiverId,
					content
				});

				// 2. Émission en TEMPS RÉEL au destinataire (s'il est en ligne)
				// On cible uniquement la room qui porte l'UUID du destinataire
				io.to(receiverId).emit("receive_private_message", newMessage);

				// 3. Optionnel : On renvoie une confirmation à l'expéditeur
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
