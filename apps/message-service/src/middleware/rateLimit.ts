import rateLimit from "express-rate-limit";

// Protection anti-abus. req.ip vient de X-Forwarded-For (trust proxy activé
// dans app.ts) car le service tourne derrière la gateway Nginx.

// Limiteur global, généreux : couvre toutes les routes (lecture incluse).
export const apiLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 300,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many requests, try again later" },
});

// Limiteur strict pour les actions qui modifient l'état (envoi de message,
// marquage lu, suppression de conversation) : limite le spam.
export const writeLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 min
	max: 60,
	standardHeaders: true,
	legacyHeaders: false,
	message: { error: "Too many write operations, try again later" },
});
