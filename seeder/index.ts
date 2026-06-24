import { Sequelize, DataTypes } from "sequelize";
import mongoose from "mongoose";
import { faker } from "@faker-js/faker";
// @ts-ignore
import process from "process";

export const sequelize = new Sequelize(process.env.POSTGRES_DB, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
	host: process.env.dbHost,
	port: process.env.dbPort,
	dialect: "postgres",
	logging: process.env.nodeEnv === "development" ? console.log : false,
});

async function seedPostgres(): Promise<void> {
	await sequelize.authenticate();
	await sequelize.sync();
}

async function seedMongoDB(): Promise<void> {

}

async function seedDatabases(): Promise<void> {
	await seedPostgres();
	await seedMongoDB();
}

seedDatabases().then(() => {
	console.log("Database seeded successfully!");
}).catch((err) => {
	console.log("Database seeding failed!", err);
});