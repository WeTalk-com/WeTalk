import { Schema, model } from "mongoose";

const MessageSchema = new Schema({
	// UUIDv4 de l'expéditeur
	senderId: {
		type: String,
		required: true,
		index: true
	},
	// UUIDv4 du destinataire
	receiverId: {
		type: String,
		required: true,
		index: true
	},
	content: {
		type: String,
		required: true,
		trim: true,
		maxlength: 1000
	},
	isRead: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true
});

// INDEX COMPOSITE CRUCIAL : Accélère grandement la récupération de la conversation entre deux utilisateurs
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const Message = model("Message", MessageSchema);