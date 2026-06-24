# WeTalk

## Présentation du projet

Le projet WeTalk vise à développer un réseau social léger et réactif, inspiré de Twitter/X, mais optimisé pour des environnements à faibles ressources. L’objectif est de concevoir une application qui permet de publier des messages courts, d’interagir avec les autres utilisateurs, et de maintenir une expérience utilisateur rapide et fluide.

L’équipe utilisera des technologies modernes pour garantir la robustesse et la scalabilité de l’application. Le back-end sera développé en Node.js avec le framework Express, gérant les requêtes via une API RESTful. Pour l'authentification et la gestion des sessions utilisateurs, nous mettrons en œuvre des JWT (JSON Web Tokens), assurant ainsi la sécurité des échanges. Le front-end sera construit en React, avec une approche mobile-first, garantissant une interface réactive et intuitive, adaptée à tous les formats d'écran.

Pour simplifier le déploiement et la gestion des environnements de développement, nous utiliserons Docker pour containeriser les services. Cette approche garantit une mise en production rapide, portable et fiable tout en facilitant la gestion des dépendances.

## Architecture

L'application sera composée de plusieurs microservices interconnectés, chacun ayant une responsabilité distincte. Le schéma ci-dessous représente une base pour vous aider dans le lancement de votre projet. Si vous jugez nécessaire de retirer ou d'ajouter des services, cela est possible, mais attention à votre charge de travail.

![Image de l'architecture cible](img_archi.png)

Description de l'image :

1. La couche Client (Front-end) : Les utilisateurs (User, Moderator, Administrator) accèdent à l'application via des appareils (PC, mobile) qui communiquent avec une interface unique développée en Next.js.

2. La couche Serveur (Back-end) : Les requêtes du Front passent d'abord par une API Gateway, qui sert de point d'entrée unique et redirige le trafic vers 4 microservices indépendants :
- User Service (Gestion des utilisateurs)
- Post Service (Gestion des publications)
- Auth Service (Gestion de l'authentification)
- Notifications Service (Gestion et envoies des notifications)

3. La couche Données (Database) : Chaque microservice possède sa propre base de données dédiée pour garantir l'indépendance du système :
- PostgreSQL pour User Service et Auth Service.
- MongoDB pour Post Service.

### Schéma d'architecture (Mermaid)

```mermaid
flowchart TB
    subgraph Client["🖥️ Couche Client (Front-end)"]
        direction LR
        U["👤 User"]
        M["🛡️ Moderator"]
        A["⚙️ Administrator"]
        FE["Next.js / React<br/>(Mobile-first, Responsive)"]
        U --> FE
        M --> FE
        A --> FE
    end

    subgraph Server["⚙️ Couche Serveur (Back-end)"]
        GW["API Gateway<br/>(Point d'entrée unique · JWT · CORS)"]

        subgraph Services["Microservices (Node.js / Express)"]
            direction LR
            AUTH["Auth Service<br/>(Authentification JWT)"]
            USER["User Service<br/>(Gestion utilisateurs)"]
            POST["Post Service<br/>(Publications, likes, commentaires, tags)"]
        end

        GW --> AUTH
        GW --> USER
        GW --> POST
    end

    subgraph Data["🗄️ Couche Données (Database)"]
        direction LR
        PG_AUTH[("PostgreSQL<br/>Auth DB")]
        PG_USER[("PostgreSQL<br/>User DB")]
        MG_POST[("MongoDB<br/>Post DB")]
    end

    FE -->|HTTPS / REST · Axios| GW

    AUTH -->|Sequelize| PG_AUTH
    USER -->|Sequelize| PG_USER
    POST -->|Mongoose| MG_POST
```

> Conteneurisation : chaque service (front, gateway, microservices, bases de données) tourne dans son propre conteneur **Docker**, orchestré via `docker-compose`.

## Technologies à utiliser

### Back-end (Node.js & Express) :

#### Technologies utilisées :

- Node.js
- Express.js
- JWT (JSON Web Tokens)
- MongoDB
- Mongoose
- Sequelize
- PostgreSQL

#### Sécurisation :

- Authentification JWT
- Gestion des erreurs
- CORS (Cross-Origin Resource Sharing)

#### Performance :

- Docker

### Front-end (React & Next.js) :

#### Technologies utilisées :

- React.js
- Next.js
- Tailwind CSS
- Axios
- React Router

#### Réactivité et UX/UI :

- Mobile-first
- Responsive
- Gestion des erreurs UI

#### Gestion des sessions :

- Stockage des JWT
- Redirection après authentification

## Fonctionnalités attendu

### Gestion des Comptes & Profils
- [ ] **Fx1. Création de comptes utilisateurs avec validation**
  *En tant que* visiteur, *je veux* créer un compte utilisateur *afin de* pouvoir accéder aux fonctionnalités de la plateforme.
- [ ] **Fx2. Authentification sécurisée**
  *En tant qu'*utilisateur, *je veux* pouvoir me connecter de manière sécurisée *pour* protéger mes informations personnelles.
- [ ] **Fx10. Profil utilisateur avec informations de base**
  *En tant qu'*utilisateur, *je veux* une page de profil affichant mon nom, ma biographie courte et ma photo de profil *pour* me présenter aux autres.
- [ ] **Fx4. Affichage des messages sur le profil**
  *En tant qu'*utilisateur, *je veux* voir tous mes messages affichés sur mon profil *afin de* les consulter ou les modifier.
- [ ] **Fx11. Liste des messages publiés par l'utilisateur sur le profil**
  *En tant qu'*utilisateur, *je veux* voir la liste de mes messages publiés sur ma page de profil.

### Publications & Interactions
- [ ] **Fx3. Publication de messages courts**
  *En tant qu'*utilisateur, *je veux* publier des messages courts (ex. : 280 caractères) *pour* partager mes idées avec mes abonnés.
- [ ] **Fx5. Flux chronologique des messages des utilisateurs suivis**
  *En tant qu'*utilisateur, *je veux* un fil d'actualités avec les messages des utilisateurs que je suis *pour* rester à jour avec leur contenu.
- [ ] **Fx6. Liker un post**
  *En tant qu'*utilisateur, *je veux* liker un post *pour* montrer mon appréciation.
- [ ] **Fx7. Répondre à un post sous forme de commentaire**
  *En tant qu'*utilisateur, *je veux* répondre à un post *pour* partager mes réactions ou avis.
- [ ] **Fx8. Répondre à un commentaire sur un post**
  *En tant qu'*utilisateur, *je veux* répondre à un commentaire sur un post *pour* participer à une discussion.
- [ ] **Fx9. Suivre ou être suivi par d'autres utilisateurs**
  *En tant qu'*utilisateur, *je veux* pouvoir suivre d'autres utilisateurs *pour* voir leur contenu dans mon fil d'actualités.

### Navigation & Recherche
- [ ] **Fx12. Ajout de tags aux messages**
  *En tant qu'*utilisateur, *je veux* ajouter des tags à mes messages *pour* les catégoriser.
- [ ] **Fx13. Recherche de posts via des tags**
  *En tant qu'*utilisateur, *je veux* rechercher des messages via des tags *pour* trouver du contenu pertinent.

### Expérience Utilisateur & Personnalisation
- [ ] **Fx22. Interface multi-langues**
  *En tant qu'*utilisateur, *je veux* choisir ma langue préférée *pour* utiliser l'application confortablement.
- [ ] **Fx23. Thème personnalisé**
  *En tant qu'*utilisateur, *je veux* personnaliser le thème de l'application *pour* améliorer mon expérience visuelle.

## Matrice de permission

| Fonctionnalité (Fx) | Visiteur | Utilisateur | Modérateur | Administrateur |
| :--- | :---: | :---: | :---: | :---: |
| **Fx1.** Création de comptes utilisateurs | ✅ | ❌ | ❌ | ✅ |
| **Fx2.** Authentification sécurisée | ❌ | ✅ | ✅ | ✅ |
| **Fx3.** Publication de messages courts | ❌ | ✅ | ✅ | ✅ |
| **Fx4.** Affichage des messages sur le profil | ❌ | ✅ *(Sien uniquement)* | ✅ | ✅ |
| **Fx5.** Flux chronologique des messages | ❌ | ✅ | ✅ | ✅ |
| **Fx6.** Liker un post | ❌ | ✅ | ✅ | ✅ |
| **Fx7.** Répondre à un post sous forme de commentaire | ❌ | ✅ | ✅ | ✅ |
| **Fx8.** Répondre à un commentaire sur un post | ❌ | ✅ | ✅ | ✅ |
| **Fx9.** Suivre ou être suivi par d'autres utilisateurs | ❌ | ✅ | ✅ | ✅ |
| **Fx10.** Profil utilisateur avec informations de base | ❌ | ✅ | ✅ | ✅ |
| **Fx11.** Liste des messages publiés sur le profil | ❌ | ✅ | ✅ | ✅ |
| **Fx12.** Ajout de tags aux messages | ❌ | ✅ | ✅ | ✅ |
| **Fx13.** Recherche de posts via des tags | ❌ | ✅ | ✅ | ✅ |
| **Fx14.** Notifications pour les mentions | ❌ | ✅ | ✅ *(Modération)* | ✅ *(Admin)* |
| **Fx15.** Notifications pour les likes | ❌ | ✅ | ❌ | ❌ |
| **Fx16.** Notifications pour les nouveaux followers | ❌ | ✅ | ❌ | ❌ |
| **Fx17.** Système de messages privés entre utilisateurs | ❌ | ✅ | ✅ | ✅ |
| **Fx18.** Ajout d’images aux messages | ❌ | ✅ | ✅ | ✅ |
| **Fx19.** Ajout de vidéos aux messages | ❌ | ✅ | ✅ | ✅ |
| **Fx20.** Signalement de contenu inapproprié | ❌ | ✅ | ✅ | ✅ |
| **Fx21.** Suspension ou bannissement des utilisateurs | ❌ | ❌ | ✅ | ✅ |
| **Fx22.** Interface multi-langues | ❌ | ✅ | ✅ | ✅ |
| **Fx23.** Thème personnalisé | ✅ | ✅ | ✅ | ✅ |

## Endpoints API — état d'intégration front

### Auth (`lib/api/auth.ts`)

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| POST | `/auth/register` | `register` | ✅ Oui |
| POST | `/auth/login` | `login` | ✅ Oui |
| POST | `/auth/logout` | `logout` | ✅ Oui |
| GET | `/auth/me` | `me` | ✅ Oui |

### Users (`lib/api/users.ts`)

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/users/me` | `getCurrentUser` / `getProfile` | ✅ Oui |
| GET | `/users/:handle` | `getUserProfile` | ✅ Oui |
| PATCH | `/users/me` | `updateProfile` | ✅ Oui |
| DELETE | `/users/me` | `deleteAccount` | ✅ Oui |
| GET | `/users?search=` | `searchUsers` | ✅ Oui |
| GET | `/users/:id/followers` | `getFollowers` | ✅ Oui |
| GET | `/users/:id/following` | `getFollowingList` | ✅ Oui |
| GET | `/users/:id/following/ids` | `getFollowingIds` | ✅ Oui |
| POST | `/users/:id/follow` | `followUser` | ✅ Oui |
| DELETE | `/users/:id/follow` | `unfollowUser` | ✅ Oui |

### Posts & commentaires (`lib/api/posts.ts`)

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/posts` | `getPosts` | ✅ Oui |
| GET | `/posts?authorId=` | `getPostsByAuthor` | ✅ Oui |
| GET | `/posts/feed` | `getFeed` | ✅ Oui |
| GET | `/posts/:id` | `getPost` | ✅ Oui |
| POST | `/posts` | `createPost` | ✅ Oui |
| PATCH | `/posts/:id` | `updatePost` | ✅ Oui |
| DELETE | `/posts/:id` | `deletePost` | ✅ Oui |
| POST | `/posts/:id/like` | `likePost` | ✅ Oui |
| DELETE | `/posts/:id/like` | `unlikePost` | ✅ Oui |
| GET | `/posts/:id/comments` | `getComments` | ✅ Oui |
| POST | `/posts/:id/comments` | `createComment` / `createReply` | ✅ Oui |
| DELETE | `/comments/:id` | `deleteComment` | ✅ Oui |
| POST | `/comments/:id/like` | `likeComment` | ✅ Oui |
| DELETE | `/comments/:id/like` | `unlikeComment` | ✅ Oui |
| POST | `/posts/:id/report` | `reportPost` | ❌ Non (stub `TODO`) |

### Notifications (`lib/api/notifications.ts`)

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/notifications` | `getNotifications` | ✅ Oui |
| GET | `/notifications/unread` | `getUnreadCount` | ✅ Oui |
| PATCH | `/notifications/:id/read` | `markNotificationRead` | ✅ Oui |

### Messages privés (`lib/api/messages.ts`) — Fx17

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/conversations` | `getConversations` | ❌ Non (mock) |
| POST | `/conversations/:id/messages` | `sendMessage` | ❌ Non (mock) |

### Modération / Admin (`lib/api/admin.ts`) — Fx20/Fx21

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/admin/reports?status=pending` | `getReportedPosts` | ❌ Non (mock) |
| POST | `/admin/reports/:id/dismiss` | `dismissReport` | ❌ Non (stub) |
| POST | `/admin/reports/:id/remove` | `removeReportedPost` | ❌ Non (stub) |

### Explore / Tendances (`lib/api/explore.ts`) — Fx13

| Méthode | Endpoint | Fonction front | Intégré |
| :--- | :--- | :--- | :---: |
| GET | `/trending` | `getTrending` | ❌ Non (mock) |

**Bilan : 28 endpoints intégrés ✅ · 8 non connectés ❌**

## Documentation Swagger

Chaque microservice expose sa doc OpenAPI via Swagger UI, accessible derrière la gateway (port 80). Slash final obligatoire.

| Service | URL |
| :--- | :--- |
| Auth | http://localhost/api-docs/auth/ |
| Users | http://localhost/api-docs/users/ |
| Posts | http://localhost/api-docs/posts/ |
| Notifications | http://localhost/api-docs/notifications/ |
| Messages | http://localhost/api-docs/messages/ |
| Media | http://localhost/api-docs/media/ |