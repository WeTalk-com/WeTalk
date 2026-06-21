// --- ASSOCIATIONS POUR LES ABONNEMENTS ---
// Les gens que JE suis
import {User} from "./user.js";
import {Follow} from "./follow.js";

User.belongsToMany(User, {
	as: 'Following',
	through: Follow,
	foreignKey: 'followerId',
	otherKey: 'followingId'
});

Follow.belongsTo(User, { as: "Following", foreignKey: "followingId" });
Follow.belongsTo(User, { as: "Follower", foreignKey: "followerId" });

// Les gens qui ME suivent
User.belongsToMany(User, {
	as: 'Followers',
	through: Follow,
	foreignKey: 'followingId',
	otherKey: 'followerId'
});

export { User, Follow };
