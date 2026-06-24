import pg from 'pg';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

// ─── Config ───────────────────────────────────────────────

const MEDIA_SVC = 'http://media-service:4004';
const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'local-access-secret-change-me';

const DB_CONFIG = {
  host: process.env.DB_HOST || 'postgres',
  port: Number(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'wetalk_db',
  user: process.env.DB_USER || 'wetalk',
  password: process.env.DB_PASSWORD || 'changeme',
};

const MONGO_URI = process.env.MONGO_URI_POST || 'mongodb://mongo:27017/wetalk_posts';

const PASSWORD = 'Password123!';
const TOTAL_RANDOM = 35;

const TEAM = [
  { username: 'rayane',   displayName: 'Rayane',   role: 'admin'     },
  { username: 'matteo',   displayName: 'Mattéo',   role: 'moderator'  },
  { username: 'azzedine', displayName: 'Azzedine', role: 'user'       },
  { username: 'adam',     displayName: 'Adam',     role: 'user'       },
  { username: 'mathis',   displayName: 'Mathis',   role: 'user'       },
];

// ─── Post templates ────────────────────────────────────────

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
  "regarder un film marocain", "faire du shopping au mall",
  "aller à la plage", "faire une sieste éclair",
  "jouer au foot avec les gars", "visiter un nouveau quartier",
  "écouter le nouveau album de", "tester un nouveau café",
  "faire du skate au parc", "regarder les matchs de la Copa",
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

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generatePostContent() {
  const fmt = Math.floor(Math.random() * 3);
  if (fmt === 0) {
    return `${randomItem(OPENERS)} ${randomItem(ACTIVITIES)}, ${randomItem(COMMENTARIES)}`;
  }
  if (fmt === 1) {
    return `${randomItem(OPENERS)} ${randomItem(LOCATIONS)} ${randomItem(ACTIVITIES)}. ${randomItem(COMMENTARIES)}`;
  }
  return `${randomItem(COMMENTARIES).slice(0, -1)} après avoir ${randomItem(ACTIVITIES)} ${randomItem(LOCATIONS)}. ${randomItem(OPENERS).toLowerCase()} !`;
}

// ─── Mongoose schemas ─────────────────────────────────────

const mediaSubSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, required: true, enum: ['image', 'video'] },
}, { _id: false });

const postSchema = new mongoose.Schema({
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  likedBy: { type: [String], default: [] },
  media: { type: mediaSubSchema, required: false },
}, { timestamps: true });

const commentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true },
  authorId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', default: null, index: true },
  likedBy: { type: [String], default: [] },
}, { timestamps: true });

const Post = mongoose.models.Post || mongoose.model('Post', postSchema);
const Comment = mongoose.models.Comment || mongoose.model('Comment', commentSchema);

// ─── JWT helper ───────────────────────────────────────────

function signJWT(payload, expiresInSec = 3600) {
  const header = JSON.stringify({ alg: 'HS256', typ: 'JWT' });
  const now = Math.floor(Date.now() / 1000);
  const full = { ...payload, iat: now, exp: now + expiresInSec };
  const b64 = (s) => Buffer.from(s).toString('base64url');
  const data = `${b64(header)}.${b64(JSON.stringify(full))}`;
  const sig = crypto.createHmac('sha256', JWT_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// ─── Media upload ─────────────────────────────────────────

async function uploadImage(buffer, filename, jwt) {
  const form = new FormData();
  form.append('file', new Blob([buffer]), filename);

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

async function fetchPicsum(seed) {
  const res = await fetch(`https://picsum.photos/seed/${seed}/600/400`, {
    signal: AbortSignal.timeout(15000),
    redirect: 'follow',
  });
  if (!res.ok) throw new Error(`picsum returned ${res.status}`);
  return res.arrayBuffer();
}

// ─── Main ─────────────────────────────────────────────────

async function main() {
  console.log('=== WeTalk Provisioner ===\n');

  // ---- Connect ----
  const pool = new pg.Pool(DB_CONFIG);
  await pool.query('SELECT 1');
  console.log('[OK] PostgreSQL connecté');

  await mongoose.connect(MONGO_URI);
  console.log('[OK] MongoDB connecté\n');

  // ---- Already provisioned ? ----
  const { rowCount: existing } = await pool.query(
    `SELECT 1 FROM users WHERE username = $1`, ['rayane']
  );
  if (existing > 0) {
    console.log('[INFO] Base déjà provisionnée, skip');
    await mongoose.disconnect();
    await pool.end();
    return;
  }

  // ---- Hash ----
  const hash = await bcrypt.hash(PASSWORD, 12);
  console.log('[OK] Mot de passe hashé (bcrypt 12)\n');

  // ━━━ 1. Création des utilisateurs ━━━━━━━━━━━━━━━━━━━━━━
  console.log('--- Création des utilisateurs ---');

  const allUsers = []; // { id, username, displayName, role }

  for (const t of TEAM) {
    const id = crypto.randomUUID();
    allUsers.push({ id, ...t });
    await pool.query(
      `INSERT INTO users (id, username, "displayName", email, "passwordHash", role, "createdAt", "updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,NOW(),NOW())`,
      [id, t.username, t.displayName, `${t.username}@wetalk.local`, hash, t.role]
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
      batch.push({
        id,
        username,
        displayName,
        email: `${username}@wetalk.local`,
        hash,
      });
    }

    const values = batch.map((u, idx) => {
      const off = idx * 6;
      return `($${off + 1},$${off + 2},$${off + 3},$${off + 4},$${off + 5},'user',NOW(),NOW())`;
    }).join(',');

    const params = batch.flatMap(u => [u.id, u.username, u.displayName, u.email, hash]);

    await pool.query(
      `INSERT INTO users (id, username, "displayName", email, "passwordHash", role, "createdAt", "updatedAt")
       VALUES ${values}`,
      params
    );
  }
  console.log(`  ✓ ${TOTAL_RANDOM} utilisateurs randoms créés\n`);

  // ━━━ 2. Abonnements ─────────────────────────────────────
  console.log('--- Abonnements ---');

  const teamIds = allUsers.slice(0, 5).map(u => u.id);
  const randomIds = allUsers.slice(5).map(u => u.id);

  let followCount = 0;
  for (let i = 0; i < randomIds.length; i += batchSize) {
    const batchFollows = [];
    for (let j = i; j < Math.min(i + batchSize, randomIds.length); j++) {
      for (const tid of teamIds) {
        batchFollows.push({ followerId: randomIds[j], followingId: tid });
      }
    }

    const values = batchFollows.map((_, idx) => {
      const off = idx * 2;
      return `($${off + 1},$${off + 2},NOW(),NOW())`;
    }).join(',');

    const params = batchFollows.flatMap(f => [f.followerId, f.followingId]);

    await pool.query(
      `INSERT INTO "Follows" ("followerId","followingId","createdAt","updatedAt") VALUES ${values}
       ON CONFLICT DO NOTHING`,
      params
    );
    followCount += batchFollows.length;
  }
  console.log(`  ✓ ${followCount} abonnements créés\n`);

  // ━━━ 3. Média & Posts ───────────────────────────────────
  console.log('--- Média & Publications ---');

  const jwt = signJWT({ sub: randomIds[0], role: 'user' });

  const imagePosts = 40;
  const uploadedUrls = [];

  for (let i = 0; i < imagePosts; i++) {
    const seed = `wetalk_${i}`;
    try {
      const buf = await fetchPicsum(seed);
      const { url } = await uploadImage(buf, `${seed}.jpg`, jwt);
      uploadedUrls.push(url);
      console.log(`  📷 Image ${i + 1}/${imagePosts} uploadée`);
    } catch (err) {
      console.log(`  ⚠️ Image ${i + 1} ignorée: ${err.message}`);
      uploadedUrls.push(null);
    }
  }

  const posts = [];
  let imgIdx = 0;

  for (let i = 0; i < randomIds.length; i++) {
    const content = generatePostContent();
    const hasImage = i < imagePosts;
    let media = undefined;

    if (hasImage && uploadedUrls[imgIdx]) {
      media = { url: uploadedUrls[imgIdx], type: 'image' };
      imgIdx++;
    } else if (hasImage) {
      imgIdx++;
    }

    posts.push({
      authorId: randomIds[i],
      content,
      media,
    });
  }

  const createdPosts = await Post.insertMany(posts);
  console.log(`  ✓ ${createdPosts.length} publications créées\n`);

  // ━━━ 4. Likes ───────────────────────────────────────────
  console.log('--- Likes ---');

  let totalLikes = 0;
  const bulkOps = [];

  for (const post of createdPosts) {
    const likeCount = 3 + Math.floor(Math.random() * 20);
    const shuffled = [...randomIds].sort(() => Math.random() - 0.5);
    const likers = shuffled.slice(0, Math.min(likeCount, randomIds.length));

    bulkOps.push({
      updateOne: {
        filter: { _id: post._id },
        update: { $set: { likedBy: likers } },
      },
    });
    totalLikes += likers.length;
  }

  if (bulkOps.length > 0) {
    await Post.bulkWrite(bulkOps);
  }
  console.log(`  ✓ ${totalLikes} likes distribués\n`);

  // ━━━ 5. Commentaires ────────────────────────────────────
  console.log('--- Commentaires ---');

  const commTemplates = [
    "Trop cool !", "Super post 🔥", "Je valise à fond",
    "Tellement d'accord", "Haha excellent", "J'adore !",
    "Magnifique photo", "Ça donne envie", "Tu gères",
    "Incroyable", "Je suis jaloux", "La classe",
    "Respect", "Trop beau", "Bien dit",
  ];

  const comments = [];
  const commentCount = 30;

  for (let i = 0; i < commentCount; i++) {
    const post = createdPosts[i % createdPosts.length];
    const author = randomIds[(i + 7) % randomIds.length];
    const content = randomItem(commTemplates);

    comments.push({
      postId: post._id,
      authorId: author,
      content,
      parentId: null,
      likedBy: [],
    });
  }

  const createdComments = await Comment.insertMany(comments);
  console.log(`  ✓ ${createdComments.length} commentaires créés`);

  // Quelques réponses
  const replies = [];
  for (let i = 0; i < 5; i++) {
    const parent = createdComments[i % createdComments.length];
    const author = randomIds[(i * 3) % randomIds.length];
    const content = ["Merci !", "Haha exactement", "Ouais carrément", "T'as raison", "Je confirme"][i];

    replies.push({
      postId: parent.postId,
      authorId: author,
      content,
      parentId: parent._id,
      likedBy: [],
    });
  }

  if (replies.length > 0) {
    await Comment.insertMany(replies);
  }
  console.log(`  ✓ ${replies.length} réponses ajoutées\n`);

  // ━━━ Done ───────────────────────────────────────────────
  await mongoose.disconnect();
  await pool.end();

  console.log('=== Provisionnement terminé ===');
  console.log(`  ${allUsers.length} utilisateurs`);
  console.log(`  ${followCount} abonnements`);
  console.log(`  ${createdPosts.length} publications`);
  console.log(`  ${totalLikes} likes`);
  console.log(`  ${createdComments.length + replies.length} commentaires`);
}

main().catch((err) => {
  console.error('ERREUR:', err);
  process.exit(1);
});
