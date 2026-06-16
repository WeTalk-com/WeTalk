import { DataTypes, Model, type InferAttributes, type InferCreationAttributes, type CreationOptional } from "sequelize";
import { sequelize } from "../config/db.js";

export type UserRole = "user" | "moderator" | "admin";

export class User extends Model<InferAttributes<User>, InferCreationAttributes<User>> {
	declare id: CreationOptional<string>;
	declare username: string;
	declare displayName: CreationOptional<string>;
	declare profileImage: CreationOptional<string>;
	declare profileBanner: CreationOptional<string>;
	declare description: CreationOptional<string>;
	declare email: string;
	declare passwordHash: string;
	declare role: CreationOptional<UserRole>;
	declare createdAt: CreationOptional<Date>;
	declare updatedAt: CreationOptional<Date>;
}

User.init(
	{
		id: {
			type: DataTypes.UUID,
			defaultValue: DataTypes.UUIDV4,
			primaryKey: true,
		},
		username: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: true,
			validate: { len: [3, 50] },
		},
		displayName: {
			type: DataTypes.STRING(50),
			allowNull: false,
			unique: false,
			validate: { len: [3, 50] },
		},
		profileImage: {
			type: DataTypes.STRING(256),
			allowNull: false,
			unique: false,
		},
		profileBanner: {
			type: DataTypes.STRING(256),
			allowNull: false,
			unique: false,
		},
		description: {
			type: DataTypes.STRING(280),
			allowNull: false,
			unique: false,
			validate: { len: [1, 280] },
		},
		email: {
			type: DataTypes.STRING(255),
			allowNull: false,
			unique: true,
			validate: { isEmail: true },
		},
		passwordHash: {
			type: DataTypes.STRING,
			allowNull: false,
		},
		role: {
			type: DataTypes.ENUM("user", "moderator", "admin"),
			allowNull: false,
			defaultValue: "user",
		},
		createdAt: DataTypes.DATE,
		updatedAt: DataTypes.DATE,
	},
	{
		sequelize,
		tableName: "users",
		modelName: "User",
	},
);
