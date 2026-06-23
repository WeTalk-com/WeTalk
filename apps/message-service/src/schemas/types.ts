export type User = {
	id: string,
	username: string,
	displayName: string|null,
	description: string|null,
	profileImage: string|null,
	profileBanner: string|null,
	role: string,
	createdAt: Date,
	updatedAt: Date,
};

export type Message = {
	text: string;
	createdAt: string;
	mine: boolean;
};

export type Conversation = {
	user: { id: string; name: string; handle: string; initial: string; verified: boolean; };
	lastMessage: string;
	lastMessageAt: string;
	unread?: number;
	messages: Message[];
};