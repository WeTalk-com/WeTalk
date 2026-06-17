# Auth Service

Microservice d'authentification de WeTalk. Node.js + Express + TypeScript, JWT, Sequelize, PostgreSQL.

Couvre **Fx1** (création de compte) et **Fx2** (authentification sécurisée).

## Endpoints

Montés sous `/auth` (la gateway expose `/api/auth/*`).

| Méthode | Route            | Auth | Description                                  |
| ------- | ---------------- | ---- | -------------------------------------------- |
| POST    | `/auth/register` | non  | Crée un compte (`username`, `email`, `password`) |
| POST    | `/auth/login`    | non  | Retourne `accessToken` + `refreshToken`      |
| POST    | `/auth/refresh`  | non  | Nouveau `accessToken` depuis `refreshToken`  |
| GET     | `/auth/me`       | oui  | Profil de l'utilisateur authentifié          |
| GET     | `/auth/verify`   | oui  | Valide un token (pour gateway/microservices) |
| GET     | `/health`        | non  | Healthcheck                                  |

Auth = en-tête `Authorization: Bearer <accessToken>`.

## Développement

```bash
cp .env.example .env        # ajuster les secrets
npm run dev --workspace=auth-service
```

Nécessite un PostgreSQL accessible (voir `.env`). Via Docker : `docker compose up auth-service`.

## Scripts

- `dev` — serveur en watch (tsx)
- `build` — compile vers `dist/`
- `start` — exécute `dist/index.js`
- `lint` / `check-types`

## Structure

```
src/
  config/      env + connexion Sequelize
  models/      modèle User
  utils/       signature/vérification JWT
  middleware/  requireAuth
  controllers/ logique register/login/refresh/me/verify
  routes/      routeur /auth
  app.ts       app Express (CORS, JSON, erreurs)
  index.ts     bootstrap (connexion DB + listen)
```
