require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const passport = require('passport');

const routes = require('./routes/main');
const passwordRoutes = require('./routes/password');
const secureRoutes = require('./routes/secure');
const { response } = require('express');

// setup mongoDB connection
mongoose.set('useFindAndModify', false); // needed for depreciation warnings
const uri = process.env.MONGO_CONNECTION_URL;
const mongoConfig = {
	useNewUrlParser: true,
	useCreateIndex: true,
};

if (process.env.MONGO_USER_NAME && process.env.MONGO_PASSWORD) {
	mongoConfig.auth = { authSource: 'admin' };
	mongoConfig.user = process.env.MONGO_USER_NAME;
	mongoConfig.pass = process.env.MONGO_PASSWORD;
}
mongoose.connect(uri, mongoConfig);

mongoose.connection.on('error', (error) => {
	console.log(error);
	process.exit(1);
});

// setup ports
const app = express();
const port = process.env.PORT || 3000;

// update express settings
app.use(bodyParser.urlencoded({ extended: false })); // parse application/x-www-form-urlencoded
app.use(bodyParser.json()); // parse application/json
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CORS_ORIGIN }));

// require passport auth
require('./auth/auth');

app.get(
	'/game.html',
	passport.authenticate('jwt', { session: false }), // protects this route
	(request, response) => {
		response.status(200).json(request.user);
	}
);

// Setup static assets
// tell express.static() to look in 'public' for static assets
app.use(express.static(__dirname + '/public'));

// allow all requests to be funneled to 'index.html' to be rendered
app.get('/', (request, response) => {
	response.send(__dirname + '/index.html');
});

// setup routes
app.use('/', routes);
app.use('/', passwordRoutes);
app.use('/', passport.authenticate('jwt', { session: false }), secureRoutes);

// catch all other routes, 'path' param defaults to '/'
// Middleware is executed sequentially, so order is important
app.use((request, response) => {
	response.status(404).json({ message: '404 - Not Found', status: 404 });
});

// handle errors, error handlers should be the last middleware
app.use((error, request, response, next) => {
	console.log(error);
	response
		.status(error.status || 500)
		.json({ error: error.message, status: 500 });
});

//connect to mongoose first, then start listening on port
mongoose.connection.on('connected', () => {
	console.log('connected to mongo');
	app.listen(port, () => {
		console.log(`server is running on port: ${port}`);
	});
});
