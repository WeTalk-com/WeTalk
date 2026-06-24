import { User } from "../models/index.js";
import { faker } from "@faker-js/faker";
import bcrypt from "bcryptjs";
import { logger } from "../utils/logger.js";

export async function createUsers() {
	try {
		const usersToInsert = [
			{
				username: "groche",
				displayName: "Gabriel Roche",
				profileImage: null,
				profileBanner: null,
				description: null,
				email: "groche@gmail.com",
				passwordHash: "$2a$12$0FZpgkF3C1RzpuQgiOp5HuE018YyooWG8m6eKFyl2njUfnDrcg8MW", // Password: a1b2R7daessdf
				role: "user",
				isBanned: false,
				suspendedUntil: null,
			},
			{
				username: "rhassani",
				displayName: "Rayane Hassani",
				profileImage: null,
				profileBanner: null,
				description: null,
				email: "rhassani@gmail.com",
				passwordHash: "$2a$12$ejzqccBztJ0PxCYQgsu21OIyFFuEyXJjVHR4YiWiWztaWHV6ubz6i", // Password: password123
				role: "moderator",
				isBanned: false,
				suspendedUntil: null,
			},
			{
				username: "ybouzjallikht",
				displayName: "Yanis Bouzjallikht",
				profileImage: null,
				profileBanner: null,
				description: faker.person.bio(),
				email: "ybouzjallikht@gmail.com",
				passwordHash: "$2a$12$ZsEFpdvospaG3g8z0GWwe.Q7nyIWLxygYLalEFxji2.p3m/ExH/ea", // Password: password456
				role: "user",
				isBanned: false,
				suspendedUntil: null,
			},
			{
				username: "tfardella",
				displayName: "Timothé Fardella",
				profileImage: null,
				profileBanner: null,
				description: faker.person.bio(),
				email: "tfardella@gmail.com",
				passwordHash: "$2b$12$r/4UgzxjtgNmlW7gtNIpdO5BYctUEFqJSfFfKE3TichDru4SWQm4W", // Password: password789
				role: "admin",
				isBanned: false,
				suspendedUntil: null,
			},
			{
				username: "mmariani",
				displayName: "Mattéo Mariani",
				profileImage: null,
				profileBanner: null,
				description: faker.person.bio(),
				email: "mmariani@gmail.com",
				passwordHash: "$2b$12$8m5P66XDVAnKXPwRwZCPLu.ZboSL1bUzT3El7DdBkxfAjLzlkRhwC", // Password: password147
				role: "user",
				isBanned: false,
				suspendedUntil: null,
			},
		];
		
		const roles = [
			{ weight: 1, value: "admin" },
			{ weight: 3, value: "moderator" },
			{ weight: 16, value: "user" }, // Représente 80% des chances (16 sur un total de 20)
		];
		
		for (let i = 0; i < 100 - usersToInsert.length; i++) {
			const fName = faker.person.firstName();
			const lName = faker.person.lastName();
			usersToInsert.push({
				username: faker.internet.username({ firstName: fName, lastName: lName }),
				displayName: faker.internet.displayName({ firstName: fName, lastName: lName }),
				profileImage: null,
				profileBanner: null,
				description: faker.person.bio(),
				email: faker.internet.email({ firstName: fName, lastName: lName }),
				passwordHash: await bcrypt.hash(faker.internet.password(), 12),
				role: faker.helpers.weightedArrayElement(roles),
				isBanned: faker.helpers.weightedArrayElement([{weight: 2, value: true}, {weight: 18, value: false}]),
				// @ts-expect-error Soo much typing fucks
				suspendedUntil: faker.helpers.weightedArrayElement([
					{ weight: 4, value: new Date(faker.date.soon({days: {min: 2, max: 30}})) },
					{ weight: 16, value: null },
				]),
			});
		}
		
		// @ts-expect-error Types, again
		await User.bulkCreate(usersToInsert);
	} catch (error) {
		logger.error((error as Error).message);
	}
}