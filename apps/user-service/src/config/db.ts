import { Sequelize } from "sequelize";
import { env } from "./env.js";

export const sequelize = new Sequelize(env.dbName, env.dbUser, env.dbPassword, {
	host: env.dbHost,
	port: env.dbPort,
	dialect: "postgres",
	logging: env.nodeEnv === "development" ? console.log : false,
});

export async function connectDb(): Promise<void> {
	await sequelize.authenticate();
	// Dev convenience: sync schema. Use migrations in production.
	await sequelize.sync({
		alter: true,
		...(env.nodeEnv === "development" ? { force: true } : {})
	});
}
