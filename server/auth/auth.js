import passport from 'passport';
import localStrategy from 'passport-local';
import jwtStrategy from 'passport-jwt';
import UserModel from '../models/UserModel';

// handle user registration
passport.use(
	'signup',
	new localStrategy.Strategy(
		{
			usernameField: 'email',
			passwordField: 'password',
			passReqToCallback: true,
		},
		async (request, email, password, done) => {
			// use async to allow await for mongoose
			try {
				const { username } = request.body;
				const user = await UserModel.create({ email, password, username });
				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

// handle user login
passport.use(
	'login',
	new localStrategy.Strategy(
		{
			usernameField: 'email',
			passwordField: 'password',
		},
		async (email, password, done) => {
			try {
				// validate user.email
				// find matching docs in db and return first result
				const user = await UserModel.findOne({ email });
				if (!user) {
					return done(new Error('user not found'), false);
				}

				// vlaidate user.password
				const valid = await user.isValidPassword(password); // helper method in UserModel
				if (!valid) {
					return done(new Error('invalid password'), false);
				}
				return done(null, user);
			} catch (error) {
				return done(error);
			}
		},
	),
);

// verify jwt
passport.use(
	new jwtStrategy.Strategy(
		{
			secretOrKey: process.env.JWT_SECRET,
			jwtFromRequest: (request) => {
				let token = null;
				if (request && request.cookies) {
					token = request.cookies.jwt;
				}
				return token;
			},
		},
		async (token, done) => {
			try {
				return done(null, token.user);
			} catch (error) {
				return done(error);
			}
		},
	),
);
