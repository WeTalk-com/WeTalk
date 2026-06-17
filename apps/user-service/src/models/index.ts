// --- ASSOCIATIONS POUR LES ABONNEMENTS ---
// Les gens que JE suis
import {User} from "./user.js";
import {Block} from "./block.js";
import {Follow} from "./follow.js";
import {Mute} from "./mute.js";

User.belongsToMany(User, {
	as: 'Following',
	through: Follow,
	foreignKey: 'followerId',
	otherKey: 'followingId'
});
// Les gens qui ME suivent
User.belongsToMany(User, {
	as: 'Followers',
	through: Follow,
	foreignKey: 'followingId',
	otherKey: 'followerId'
});

// --- ASSOCIATIONS POUR LES BLOCAGES ---
User.belongsToMany(User, {
	as: 'BlockedUsers',
	through: Block,
	foreignKey: 'blockerId',
	otherKey: 'blockedId'
});

// --- ASSOCIATIONS POUR LES MASQUAGES ---
User.belongsToMany(User, {
	as: 'MutedUsers',
	through: Mute,
	foreignKey: 'muterId',
	otherKey: 'mutedId'
});

export { User, Follow, Block, Mute };
