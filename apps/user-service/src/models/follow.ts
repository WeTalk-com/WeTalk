import {DataTypes} from 'sequelize';
import {sequelize} from "../config/db.js";
import {User} from "./user.js";

export const Follow = sequelize.define('Follow', {
	followerId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	},
	followingId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	}
}, {
	indexes: [
		// Clé primaire composite (évite les doublons d'abonnement et accélère la recherche "qui je suis")
		{ unique: true, fields: ['followerId', 'followingId'] },
		// Index inverse indispensable pour compter ou lister les abonnés ("qui me suit")
		{ fields: ['followingId'] }
	]
});