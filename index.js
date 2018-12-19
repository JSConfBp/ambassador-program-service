if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const Hapi = require('hapi')
const Boom = require('boom')

const createRedisClient = require('./lib/createRedisClient')

const registerRouteHandler = require('./routes/register')
const slackRespondRouteHandler = require('./routes/slack-respond')
const googleAuthHandler = require('./routes/google-auth')

let server = Hapi.server({
    port: process.env.PORT,
    host: '0.0.0.0'
});

server = createRedisClient(server)

server.route({
    method: 'POST',
	path: '/register',
	options: {
		cors: true
	},
    handler: registerRouteHandler
});

server.route({
    method: 'POST',
	path: '/slack-respond',
	options: {
		cors: true
	},
    handler: slackRespondRouteHandler
});

server.route({
    method: 'GET',
	path: '/google-auth',
	options: {
		cors: true
	},
    handler: googleAuthHandler
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

init();