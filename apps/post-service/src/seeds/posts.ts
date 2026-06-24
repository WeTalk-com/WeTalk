import axios from "axios";
import { env } from "../config/env.js";
import { faker } from "@faker-js/faker";
import { PostModel } from "../models/post.js";

export async function createPosts() {
	const users = await axios.get(`${env.userServiceUrl}/users?limit=100`);
	const userIds: string[] = users.data.map((user: { id: never; }) => user.id as string);
	
	const posts = [];
	
	for (let i = 0; i < faker.helpers.rangeToNumber({min: 20, max: 200}); i++) {
		posts.push({
			authorId: faker.helpers.arrayElement(userIds),
			content: faker.lorem.paragraph(),
			likedBy: faker.helpers.arrayElements(userIds, {min: 0, max: 100}),
		});
	}
	
	await PostModel.insertMany(posts);
}