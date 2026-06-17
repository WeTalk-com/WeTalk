import rateLimit from "express-rate-limit";

// Brute-force protection. req.ip vient de X-Forwarded-For (trust proxy activé
// dans app.ts) car le service tourne derrière la gateway Nginx.

export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many login attempts, try again later" },
});

export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 h
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many accounts created, try again later" },
});
