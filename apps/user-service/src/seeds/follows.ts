import { Follow, User } from "../models/index.js";
import { faker } from "@faker-js/faker";

function generateAllUserPairs(ids: string[]): Array<[string, string]> {
	const pairs: Array<[string, string]> = [];
	
	for (let i = 0; i < ids.length; i++) {
		for (let j = i + 1; j < ids.length; j++) {
			// On stocke le duo sous forme de tableau [Valeur1, Valeur2]
			pairs.push([ids[i] as string, ids[j] as string]);
		}
	}
	return pairs;
}

export async function createFollow() {
	const allFollowing = generateAllUserPairs((await User.findAll({limit: 100})).map(user => user.id));
	const randomizedPairs = faker.helpers.shuffle(allFollowing);
	
	const numberOfDuosNeeded = faker.helpers.rangeToNumber({ min: 30, max: randomizedPairs.length });
	const myFinalDuos = randomizedPairs.slice(0, numberOfDuosNeeded);
	
	// @ts-expect-error Types, again
	await Follow.bulkCreate(myFinalDuos);
}