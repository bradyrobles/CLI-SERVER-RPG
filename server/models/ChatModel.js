import mongoose from 'mongoose';

const { Schema } = mongoose;

const ChatSchema = new Schema({
	email: {
		type: String,
		required: true,
	},
	message: {
		type: String,
		required: true,
	},
});

ChatSchema.on('index', (err) => {
	if (err) {
		console.error(err);
	}
});

const ChatModel = mongoose.model('chat', ChatSchema);

export default ChatModel;
