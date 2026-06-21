// models/Message.js
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
	// UUIDv4 de l'expéditeur (provient de votre service User PostgreSQL)
	senderId: {
		type: String,
		required: true,
		index: true // Index pour accélérer les recherches
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
		maxlength: 1000 // Limite Twitter-like pour les DM
	},
	isRead: {
		type: Boolean,
		default: false
	}
}, {
	timestamps: true // Crée automatiquement createdAt (date d'envoi) et updatedAt
});

// INDEX COMPOSITE CRUCIAL : Accélère grandement la récupération de la conversation entre deux utilisateurs
MessageSchema.index({ senderId: 1, receiverId: 1, createdAt: -1 });

export const Message = mongoose.model("Message", MessageSchema);

// module.exports = mongoose.model('Message', MessageSchema);