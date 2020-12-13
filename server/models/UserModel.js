const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const { Schema } = mongoose;

const UserSchema = new Schema({
	email: {
		type: String,
		required: true,
		index: {
			unique: true,
			dropDups: true,
		},
	},
	password: {
		type: String,
		required: true,
	},
	username: {
		type: String,
		required: true, //validation done by mongoose for required fields
	},
	resetToken: {
		type: String,
	},
	resetTokenExp: {
		type: Date,
	},
});

// pre-save is a mongoose hook that lets us run code before 'save'ing a user
// to our database
UserSchema.pre('save', async function (next) {
	const hash = await bcrypt.hash(this.password, 10);
	this.password = hash;
	next();
});

UserSchema.on('index', function (err) {
	if (err) {
		console.error(err);
	}
});

UserSchema.methods.isValidPassword = async function (password) {
	const user = this;
	const compare = await bcrypt.compare(password, user.password);
	return compare;
};

const UserModel = mongoose.model('user', UserSchema);

module.exports = UserModel;
