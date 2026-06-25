import pg from 'pg';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const VIDEO_PATH = path.join(__dirname, 'data', 'video_test.mp4');

const MEDIA_SVC = 'http://media-service:4004';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'local-access-secret-change-me';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'wetalk_db',
  user: process.env.DB_USER || 'wetalk',
  password: process.env.DB_PASSWORD || 'changeme',
};

const MONGO_URI_POST = process.env.MONGO_URI_POST || 'mongodb://mongo:27017/wetalk_posts';
const MONGO_URI_MESSAGE = process.env.MONGO_URI_MESSAGE || 'mongodb://mongo:27017/wetalk_message';
const MONGO_URI_NOTIF = process.env.MONGO_URI_NOTIFICATIONS || 'mongodb://mongo:27017/wetalk_notifications';

const PASSWORD = 'Password123!';
const TOTAL_RANDOM = 95; // 5 team + 95 = 100 utilisateurs

// Mock data injecté uniquement si MOCK_DATA=true (sinon le provisioner ne fait rien).
const MOCK_DATA = process.env.MOCK_DATA === 'true';

// L'équipe : au moins 1 admin + 1 modérateur parmi les 5.
const TEAM = [
  { username: 'rayane',  displayName: 'Rayane',  role: 'user',     description: "wewedz" },
  { username: 'matteo',  displayName: 'Mattéo',  role: 'user', description: "tortue" },
  { username: 'yanis',   displayName: 'Yanis',   role: 'admin',      description: "AH BON??? AH OEE" },
  { username: 'gabynou', displayName: 'Gabynou', role: 'moderator',      description: "tono" },
  { username: 'tim',     displayName: 'Tim',     role: 'admin',      description: "wetalk together" },
];

// ─── Templates de posts ───────────────────────────────────

const OPENERS = [
  "Aujourd'hui je suis allé", "Quelle journée pour",
  "Je viens de", "Rien de tel que",
  "Petit moment", "Après une longue semaine,",
  "J'ai passé l'après-midi à", "Trop hâte de",
  "Franchement,", "Je me suis levé et",
  "Le meilleur moment :", "Encore une journée à",
  "C'est décidé, je vais", "Je kiffe grave",
  "Qui d'autre aime", "Tranquillement en train de",
  "Incroyable :", "Besoin de vos avis :",
  "Ça y est, j'ai enfin", "Petite pensée pour",
];

const ACTIVITIES = [
  "faire du sport sur la corniche", "manger un bon couscous",
  "regarder le coucher de soleil", "trainer avec les potes",
  "écouter du rap français", "coder un petit projet",
  "lire un bon livre", "boire un thé à la menthe",
  "me balader en ville", "prendre des photos de rue",
  "cuisiner un tajine aux pruneaux", "réviser mes partiels",
  "regarder un film", "faire du shopping au mall",
  "aller à la plage", "faire une sieste éclair",
  "jouer au foot avec les gars", "visiter un nouveau quartier",
  "écouter le nouvel album", "tester un nouveau café",
  "faire du skate au parc", "regarder les matchs",
  "trainer sur WeTalk", "bosser sur mon projet",
  "sortir les chiens", "jardiner un peu",
  "réparer mon PC", "faire du vélo en ville",
];

const COMMENTARIES = [
  "La vie est belle #WeTalk", "Un pur moment de bonheur.",
  "Je valide à 100%", "C'est ça la buena vida.",
  "Parfait pour décompresser.", "Je recommande à tous.",
  "On profite de chaque instant.", "Le meilleur moment de la semaine.",
  "C'était incroyable sérieux.", "À refaire absolument !",
  "🔥🔥🔥", "☀️☀️☀️",
  "Qui veut venir avec moi ?", "J'aurais dû faire ça plus tôt.",
  "Rien de mieux pour commencer la journée.", "La simplicité fait le bonheur.",
];

const LOCATIONS = [
  "à Casablanca", "à Marrakech", "à Rabat", "à Tanger",
  "à Fès", "à Agadir", "dans mon quartier", "au centre-ville",
  "à la maison", "chez des amis",
];

// Pool de hashtags
const HASHTAGS = [
  "#WeTalk", "#GoldenHour", "#Maroc", "#Foot", "#Rap", "#Photo",
  "#Voyage", "#Food", "#Tech", "#Dev", "#Plage", "#Bonheur",
  "#Casablanca", "#Marrakech", "#Musique", "#Sport", "#Lecture", "#Café",
];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

const TAG_RE = /#([\p{L}\p{N}_]+)/gu;
function extractTags(content) {
  const tags = new Set();
  for (const match of content.matchAll(TAG_RE)) {
    const tag = match[1]?.toLowerCase();
    if (tag && tag.length <= 50) tags.add(tag);
    if (tags.size >= 10) break;
  }
  return [...tags];
}

function randomHashtags() {
  if (Math.random() < 0.2) return ""; // ~20% sans tag
  const n = 1 + (Math.random() < 0.4 ? 1 : 0);
  const picked = new Set();
  while (picked.size < n) picked.add(randomItem(HASHTAGS));
  return " " + [...picked].join(" ");
}

function generatePostContent() {
  const fmt = Math.floor(Math.random() * 3);
  let base;
  if (fmt === 0) {
    base = `${randomItem(OPENERS)} ${randomItem(ACTIVITIES)}, ${randomItem(COMMENTARIES)}`;
  } else if (fmt === 1) {
    base = `${randomItem(OPENERS)} ${randomItem(LOCATIONS)} ${randomItem(ACTIVITIES)}. ${randomItem(COMMENTARIES)}`;
  } else {
    base = `${randomItem(COMMENTARIES).slice(0, -1)} après avoir ${randomItem(ACTIVITIES)} ${randomItem(LOCATIONS)}. ${randomItem(OPENERS).toLowerCase()} !`;
  }
  return (base + randomHashtags()).slice(0, 280);
}

// ─── Schémas Mongoose (alignés sur les microservices) ──────

const mediaSubSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ['image', 'video'] },
}, { _id: false });

const postSchema = new mongoose.Schema({
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  likedBy: { type: [String], default: [] },
  tags: { type: [String], default: [], index: true },
  media: { type: mediaSubSchema, required: false },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
  likedBy: { type: [String], default: [] },
  tags: { type: [String], default: [], index: true },
}, { timestamps: true });

const messageSchema = new mongoose.Schema({
  senderId: { type: String, required: true, index: true },
  receiverId: { type: String, required: true, index: true },
  content: { type: String, required: true, trim: true, maxlength: 1000 },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  recipientId: { type: String, required: true, index: true },
  actorId: { type: String, required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'mention'], required: true },
  postId: String,
  commentId: String,
  preview: String,
  read: { type: Boolean, default: false },
}, { timestamps: true });

// ─── Helpers JWT / réseau ──────────────────────────────────

function signJWT(payload, expiresInSec = 3600) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + expiresInSec };
  const b64 = (s) => Buffer.from(s).toString('base64url');
  const data = `${b64(header)}.${b64(JSON.stringify(full))}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

async function uploadMedia(buffer, filename, jwt, contentType = 'image/jpeg') {
  const form = new FormData();
  // Le type MIME du Blob devient le Content-Type de la part → media-service le valide.
  form.append('file', new Blob([buffer], { type: contentType }), filename);
  const res = await fetch(`${MEDIA_SVC}/media/`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${jwt}` },
    body: form,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`media upload failed (${res.status}): ${text}`);
  }
  return res.json();
}

async function fetchPicsum(seed, w = 600, h = 400) {
  const res = await fetch(`https://picsum.photos/seed/${seed}/${w}/${h}`, {
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`picsum returned ${res.status}`);
  return res.arrayBuffer();
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('=== WeTalk Provisioner ===\n');

  if (!MOCK_DATA) {
    console.log('[INFO] MOCK_DATA != "true", aucun mock data injecté (skip)');
    return;
  }

  // ---- Connexions ----
  const pool = new pg.Pool(DB_CONFIG);
  await pool.query('SELECT 1');
  console.log('[OK] PostgreSQL connecté');

  const postConn = await mongoose.createConnection(MONGO_URI_POST).asPromise();
  const msgConn = await mongoose.createConnection(MONGO_URI_MESSAGE).asPromise();
  const notifConn = await mongoose.createConnection(MONGO_URI_NOTIF).asPromise();
  console.log('[OK] MongoDB connecté (posts / messages / notifications)\n');

  const Post = postConn.model('Post', postSchema);
  const Comment = postConn.model('Comment', commentSchema);
  const Message = msgConn.model('Message', messageSchema);
  const Notification = notifConn.model('Notification', notificationSchema);

  const closeAll = async () => {
    await Promise.allSettled([postConn.close(), msgConn.close(), notifConn.close(), pool.end()]);
  };

  // ---- Déjà provisionné ? ----
  const { rowCount: existing } = await pool.query(
    `SELECT 1 FROM users WHERE username = $1`, ['tim']
  );
  if (existing > 0) {
    console.log('[INFO] Base déjà provisionnée, skip');
    await closeAll();
    return;
  }

  // ---- Hash ----
  const hash = await bcrypt.hash(PASSWORD, 12);
  console.log('[OK] Mot de passe hashé (bcrypt 12)\n');

  // ━━━ 1. Utilisateurs ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Création des utilisateurs ---');

  const allUsers = []; // { id, username, displayName, role }
  const teamUsers = [];

  for (const t of TEAM) {
    const id = crypto.randomUUID();
    const u = { id, ...t };
    allUsers.push(u);
    teamUsers.push(u);

    // Avatar + bannière de profil pour l'équipe (joli rendu en démo)
    const jwt = signJWT({ sub: id, role: t.role });
    let profileImage = null;
    let profileBanner = null;
    try {
      const buf = await fetchPicsum(`avatar_${t.username}`, 200, 200);
      profileImage = (await uploadMedia(buf, `avatar_${t.username}.jpg`, jwt)).url;
    } catch (err) {
      console.log(`  ⚠️ avatar ${t.username} ignoré: ${err.message}`);
    }
    try {
      const buf = await fetchPicsum(`banner_${t.username}`, 1200, 400);
      profileBanner = (await uploadMedia(buf, `banner_${t.username}.jpg`, jwt)).url;
    } catch (err) {
      console.log(`  ⚠️ bannière ${t.username} ignorée: ${err.message}`);
    }

    await pool.query(
      `INSERT INTO users (id, username, "displayName", email, "passwordHash", role, description, "profileImage", "profileBanner", "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,NOW(),NOW())`,
      [id, t.username, t.displayName, `${t.username}@wetalk.local`, hash, t.role, t.description, profileImage, profileBanner]
    );
    console.log(`  ✓ ${t.username} (${t.role})`);
  }

  const batchSize = 20;

  for (let i = 1; i <= TOTAL_RANDOM; i += batchSize) {
    const batch = [];
    for (let j = i; j < Math.min(i + batchSize, TOTAL_RANDOM + 1); j++) {
      const id = crypto.randomUUID();
      const username = `user_${j}`;
      const displayName = `Utilisateur ${j}`;
      allUsers.push({ id, username, displayName, role: 'user' });
      batch.push({ id, username, displayName, email: `${username}@wetalk.local` });
    }

    const values = batch.map((u, idx) => {
      const off = idx * 5;
      return `($${off + 1},$${off + 2},$${off + 3},$${off + 4},$${off + 5},'user',NOW(),NOW())`;
    }).join(',');

    const params = batch.flatMap(u => [u.id, u.username, u.displayName, u.email, hash]);

    await pool.query(
      `INSERT INTO users (id, username, "displayName", email, "passwordHash", role, "createdAt", "updatedAt")
       VALUES ${values}`,
      params
    );
  }
  console.log(`  ✓ ${TOTAL_RANDOM} utilisateurs randoms créés (total ${allUsers.length})\n`);

  const teamIds = teamUsers.map(u => u.id);
  const randomIds = allUsers.slice(TEAM.length).map(u => u.id);
  const usernameById = new Map(allUsers.map(u => [u.id, u.username]));
  const notifs = []; // tampon des notifications

  // ━━━ 2. Abonnements ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Abonnements ---');

  const followPairs = [];
  // Tout le monde suit l'équipe
  for (const rid of randomIds) {
    for (const tid of teamIds) followPairs.push([rid, tid]);
  }
  // L'équipe se suit entre elle
  for (const a of teamIds) {
    for (const b of teamIds) {
      if (a !== b) followPairs.push([a, b]);
    }
  }
  // Un peu de suivi aléatoire entre randoms
  for (const rid of randomIds) {
    const targets = [...randomIds].sort(() => Math.random() - 0.5).slice(0, 3 + Math.floor(Math.random() * 5));
    for (const t of targets) if (t !== rid) followPairs.push([rid, t]);
  }

  for (let i = 0; i < followPairs.length; i += batchSize) {
    const slice = followPairs.slice(i, i + batchSize);
    const values = slice.map((_, idx) => {
      const off = idx * 2;
      return `($${off + 1},$${off + 2},NOW(),NOW())`;
    }).join(',');
    const params = slice.flatMap(([f, g]) => [f, g]);
    await pool.query(
      `INSERT INTO "Follows" ("followerId","followingId","createdAt","updatedAt") VALUES ${values}
       ON CONFLICT DO NOTHING`,
      params
    );
  }
  console.log(`  ✓ ${followPairs.length} abonnements créés`);

  // Notifications de follow pour l'équipe (les ~12 plus récents par membre)
  for (const tid of teamIds) {
    const followers = randomIds.slice(0, 12);
    for (const actor of followers) {
      notifs.push({ recipientId: tid, actorId: actor, type: 'follow', read: Math.random() < 0.4 });
    }
  }
  console.log(`  ✓ notifications de follow préparées\n`);

  // ━━━ 3. Médias (images + vidéo) ━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Médias (upload) ---');

  const jwtUpload = signJWT({ sub: randomIds[0], role: 'user' });
  const imagePosts = 40;
  const uploadedUrls = [];

  for (let i = 0; i < imagePosts; i++) {
    const seed = `wetalk_${i}`;
    try {
      const buf = await fetchPicsum(seed);
      const { url } = await uploadMedia(buf, `${seed}.jpg`, jwtUpload, 'image/jpeg');
      uploadedUrls.push(url);
      console.log(`  📷 Image ${i + 1}/${imagePosts} uploadée`);
    } catch (err) {
      console.log(`  ⚠️ Image ${i + 1} ignorée: ${err.message}`);
      uploadedUrls.push(null);
    }
  }

  // Vidéo de démo (Fx19) — uploadée une fois, réutilisée par quelques posts d'équipe.
  let videoUrl = null;
  try {
    const videoBuf = fs.readFileSync(VIDEO_PATH);
    videoUrl = (await uploadMedia(videoBuf, 'video_test.mp4', jwtUpload, 'video/mp4')).url;
    console.log(`  🎬 Vidéo uploadée (${(videoBuf.length / 1e6).toFixed(1)} Mo)`);
  } catch (err) {
    console.log(`  ⚠️ Vidéo ignorée: ${err.message}`);
  }

  // ━━━ 4. Publications ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('\n--- Publications ---');

  // L'équipe publie davantage (profils vivants pour la démo)
  const authors = [];
  for (const tid of teamIds) for (let k = 0; k < 3; k++) authors.push(tid);
  for (const rid of randomIds) {
    authors.push(rid);
    if (Math.random() < 0.4) authors.push(rid); // certains postent 2x
  }
  authors.sort(() => Math.random() - 0.5);

  const posts = authors.map((authorId, i) => {
    const post = { authorId, content: generatePostContent() };
    if (i < imagePosts && uploadedUrls[i]) {
      post.media = { url: uploadedUrls[i], type: 'image' };
    }
    return post;
  });

  // Posts vidéo : 1 par membre de l'équipe (réutilise la même vidéo de démo).
  if (videoUrl) {
    for (const t of teamUsers) {
      posts.push({
        authorId: t.id,
        content: `Petite vidéo pour vous 🎥 ${randomItem(COMMENTARIES)}`,
        media: { url: videoUrl, type: 'video' },
      });
    }
  }

  const createdPosts = await Post.insertMany(
    posts.map((p) => ({ ...p, tags: extractTags(p.content) }))
  );
  console.log(`  ✓ ${createdPosts.length} publications créées`);

  const teamPosts = createdPosts.filter(p => teamIds.includes(p.authorId));
  console.log(`  ✓ dont ${teamPosts.length} publiées par l'équipe\n`);

  // ━━━ 5. Likes ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Likes ---');

  let totalLikes = 0;
  const likeOps = [];

  for (const post of createdPosts) {
    const likeCount = 3 + Math.floor(Math.random() * 20);
    const shuffled = [...randomIds].sort(() => Math.random() - 0.5);
    const likers = shuffled.slice(0, Math.min(likeCount, randomIds.length));
    likeOps.push({ updateOne: { filter: { _id: post._id }, update: { $set: { likedBy: likers } } } });
    totalLikes += likers.length;

    // Notifications de like pour les posts de l'équipe (max 5 acteurs/post)
    if (teamIds.includes(post.authorId)) {
      for (const actor of likers.slice(0, 5)) {
        notifs.push({
          recipientId: post.authorId, actorId: actor, type: 'like',
          postId: String(post._id), preview: post.content.slice(0, 80),
          read: Math.random() < 0.3,
        });
      }
    }
  }
  if (likeOps.length > 0) await Post.bulkWrite(likeOps);
  console.log(`  ✓ ${totalLikes} likes distribués\n`);

  // ━━━ 6. Commentaires ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Commentaires ---');

  const commTemplates = [
    "Trop cool !", "Super post 🔥", "Je valide à fond",
    "Tellement d'accord", "Haha excellent", "J'adore !",
    "Magnifique photo", "Ça donne envie", "Tu gères",
    "Incroyable", "Je suis jaloux", "La classe",
    "Respect", "Trop beau", "Bien dit",
  ];

  const comments = [];
  // 2 commentaires par post de l'équipe + 30 commentaires épars
  for (const post of teamPosts) {
    for (let k = 0; k < 2; k++) {
      comments.push({
        postId: post._id,
        authorId: randomItem(randomIds),
        content: randomItem(commTemplates),
        parentId: null, likedBy: [],
      });
    }
  }
  for (let i = 0; i < 30; i++) {
    const post = createdPosts[i % createdPosts.length];
    comments.push({
      postId: post._id,
      authorId: randomIds[(i + 7) % randomIds.length],
      content: randomItem(commTemplates),
      parentId: null, likedBy: [],
    });
  }

  const createdComments = await Comment.insertMany(
    comments.map((c) => ({ ...c, tags: extractTags(c.content) }))
  );
  console.log(`  ✓ ${createdComments.length} commentaires créés`);

  // Réponses
  const replies = [];
  for (let i = 0; i < 8; i++) {
    const parent = createdComments[i % createdComments.length];
    replies.push({
      postId: parent.postId,
      authorId: randomIds[(i * 3) % randomIds.length],
      content: ["Merci !", "Haha exactement", "Ouais carrément", "T'as raison", "Je confirme", "Bien vu", "+1", "Grave"][i],
      parentId: parent._id, likedBy: [],
    });
  }
  if (replies.length > 0) await Comment.insertMany(
    replies.map((r) => ({ ...r, tags: extractTags(r.content) }))
  );
  console.log(`  ✓ ${replies.length} réponses ajoutées`);

  // Notifications de commentaire pour l'équipe
  const postAuthorById = new Map(createdPosts.map(p => [String(p._id), p.authorId]));
  for (const c of createdComments) {
    const recipient = postAuthorById.get(String(c.postId));
    if (recipient && teamIds.includes(recipient) && recipient !== c.authorId) {
      notifs.push({
        recipientId: recipient, actorId: c.authorId, type: 'comment',
        postId: String(c.postId), commentId: String(c._id),
        preview: c.content.slice(0, 80), read: Math.random() < 0.3,
      });
    }
  }
  console.log(`  ✓ notifications de commentaire préparées\n`);

  // ━━━ 7. Mentions ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Mentions ---');

  const mentionPosts = [];
  for (const t of teamUsers) {
    // 2 posts de randoms qui mentionnent ce membre
    for (let k = 0; k < 2; k++) {
      const author = randomItem(randomIds);
      mentionPosts.push({
        authorId: author,
        content: `Hâte de voir le prochain projet de @${t.username} 🚀 ${randomItem(COMMENTARIES)}`,
        _recipient: t.id,
      });
    }
  }
  const createdMentions = await Post.insertMany(
    mentionPosts.map(({ _recipient, ...p }) => ({ ...p, tags: extractTags(p.content) }))
  );
  createdMentions.forEach((p, idx) => {
    const { authorId, _recipient } = mentionPosts[idx];
    notifs.push({
      recipientId: _recipient, actorId: authorId, type: 'mention',
      postId: String(p._id), preview: p.content.slice(0, 80),
      read: Math.random() < 0.2,
    });
  });
  console.log(`  ✓ ${createdMentions.length} posts avec mention créés\n`);

  // ━━━ 8. Notifications (insertion) ━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Notifications ---');
  const createdNotifs = await Notification.insertMany(notifs);
  console.log(`  ✓ ${createdNotifs.length} notifications créées\n`);

  // ━━━ 9. Messages privés ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Messages privés ---');

  const msgTemplates = [
    "Salut, ça va ?", "T'as vu mon dernier post ?", "On se cale un truc ce week-end ?",
    "Haha t'es sérieux 😂", "Carrément d'accord", "Je te rappelle plus tard",
    "T'as avancé sur le projet ?", "Faut qu'on parle de WeTalk", "Bien ouej pour hier !",
    "Tu viens demain ?", "J'ai une idée de ouf à te montrer", "Merci pour le coup de main 🙏",
    "Ça marche, à plus !", "Trop bien ton idée", "On en reparle de vive voix",
  ];

  const conversations = [];
  // Toutes les paires de l'équipe discutent
  for (let a = 0; a < teamIds.length; a++) {
    for (let b = a + 1; b < teamIds.length; b++) {
      conversations.push([teamIds[a], teamIds[b]]);
    }
  }
  // Quelques randoms écrivent à l'équipe
  for (const tid of teamIds) {
    for (let k = 0; k < 2; k++) conversations.push([randomItem(randomIds), tid]);
  }

  const messages = [];
  const now = Date.now();
  for (const [u1, u2] of conversations) {
    const count = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < count; i++) {
      const sender = i % 2 === 0 ? u1 : u2;
      const receiver = i % 2 === 0 ? u2 : u1;
      const ts = new Date(now - (count - i) * 3600 * 1000 - Math.floor(Math.random() * 1800000));
      messages.push({
        senderId: sender, receiverId: receiver,
        content: randomItem(msgTemplates),
        isRead: i < count - 1, // dernier message non lu
        createdAt: ts, updatedAt: ts,
      });
    }
  }
  const createdMessages = await Message.insertMany(messages);
  console.log(`  ✓ ${createdMessages.length} messages privés créés (${conversations.length} conversations)\n`);

  // ━━━ Fin ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  await closeAll();

  console.log('=== Provisionnement terminé ===');
  console.log(`  ${allUsers.length} utilisateurs (équipe: ${TEAM.map(t => t.username).join(', ')})`);
  console.log(`  ${followPairs.length} abonnements`);
  console.log(`  ${createdPosts.length + createdMentions.length} publications`);
  console.log(`  ${totalLikes} likes`);
  console.log(`  ${createdComments.length + replies.length} commentaires`);
  console.log(`  ${createdNotifs.length} notifications`);
  console.log(`  ${createdMessages.length} messages privés`);
  console.log(`\n  Login démo: <username>@wetalk.local / ${PASSWORD}`);
}

main().catch((err) => {
  console.error('ERREUR:', err);
  process.exit(1);
});
