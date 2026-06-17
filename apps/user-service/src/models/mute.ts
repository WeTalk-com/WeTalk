import {sequelize} from "../config/db.js";
import {DataTypes} from "sequelize";
import {User} from "./user.js";

export const Mute = sequelize.define('Mute', {
	muterId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	},
	mutedId: {
		type: DataTypes.UUID,
		allowNull: false,
		references: { model: User, key: 'id' },
		onDelete: 'CASCADE'
	}
}, {
	indexes: [
		{ unique: true, fields: ['muterId', 'mutedId'] },
		{ fields: ['mutedId'] }
	]
});