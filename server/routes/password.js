const express = require('express');
const router = express.Router();

const hbs = require('nodemailer-express-handlebars');
const nodemailer = require('nodemailer');
const path = require('path'); //needed when we configure handlebars to point to template directory

const UserModel = require('../models/UserModel');
let crypto;
try {
	crypto = require('crypto');
} catch (err) {
	console.log('crypto support is disabled!');
}
const email = process.env.EMAIL;
const password = process.env.PASSWORD;

const smtpTransport = nodemailer.createTransport({
	service: process.env.EMAIL_PROVIDER,
	auth: {
		user: email,
		pass: password,
	},
});

const handlebarsOptions = {
	// tell nodemailer which engine to use,
	// in this case 'express-handlebars' for injecting variables into html
	viewEngine: {
		extName: '.hbs',
		defaultLayout: null,
		partialsDir: './templates/',
		layoutsDir: './templates/',
	},
	viewPath: path.resolve('./templates/'),
	extName: '.html',
};

smtpTransport.use('compile', hbs(handlebarsOptions));

router.post('/forgot-password', async (request, response) => {
	if (Object.keys(request.body).length == 0 || !request.body.email) {
		response.status(400).json({ message: 'invalid body', status: 400 });
	} else {
		const userEmail = request.body.email;
		const user = await UserModel.findOne({ email: userEmail });
		if (!user) {
			response.status(400).json({
				message: 'invalid email',
				status: 400,
			});
			return;
		}
		// create user token
		const buffer = crypto.randomBytes(20);
		const token = buffer.toString('hex');

		// update user reset password token and expiration
		await UserModel.findByIdAndUpdate(
			{ _id: user._id },
			{ resetToken: token, resetTokenExp: Date.now() + 60000 }
		);
		// send user password reset email
		const emailOptions = {
			to: userEmail,
			from: email,
			template: 'forgot-password',
			subject: 'MMO Password Reset',
			context: {
				name: user.username,
				url: `http://localhost:${
					process.env.PORT || 3000
				}/reset-password.html?token=${token}`,
			},
		};
		// send user password reset email
		await smtpTransport.sendMail(emailOptions);
		response.status(200).json({
			message:
				'An email has been sent to your email address. Password reset link is only valid for 10 minutes.',
			status: 200,
		});
	}
});

router.post('/reset-password', async (request, response) => {
	if (Object.keys(request.body).length == 0 || !request.body.email) {
		response.status(400).json({ message: 'invalid body', status: 400 });
	} else {
		const userEmail = request.body.email;
		const user = await UserModel.findOne({
			resetToken: request.body.token,
			resetTokenExp: { $gt: Date.now() }, // check if token is expired with greater than 'gt' search tags
			email: userEmail,
		});
		if (!user) {
			response.status(400).json({
				message: 'invalid token',
				status: 400,
			});
			return;
		}
		if (
			!request.body.password ||
			!request.body.verifiedPassword ||
			request.body.password !== request.body.verifiedPassword
		) {
			response
				.status(400)
				.json({ message: 'passwords do not match', status: 400 });
			return;
		}

		//update user model
		user.password = request.body.password;
		user.resetToken = undefined;
		user.resetTokenExp = undefined;
		await user.save();

		const emailOptions = {
			to: userEmail,
			from: email,
			template: 'reset-password',
			subject: 'MMO Password Reset Confirmation',
			context: {
				name: user.username,
			},
		};
		// send user password reset email
		await smtpTransport.sendMail(emailOptions);
		response.status(200).json({
			message: 'Password updated.',
			status: 200,
		});
	}
});

module.exports = router;
