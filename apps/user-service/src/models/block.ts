import {sequelize} from "../config/db.js";
import {DataTypes} from "sequelize";
import {User} from "./user.js";

export const Block = sequelize.define('Block', {
	blockerId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	},
	blockedId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	}
}, {
	indexes: [
		{ unique: true, fields: ['blockerId', 'blockedId'] },
		{ fields: ['blockedId'] }
	]
});