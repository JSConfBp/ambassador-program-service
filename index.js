if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const Hapi = require('hapi')
const Boom = require('boom')

const port = process.env.PORT

const server = Hapi.server({
    port,
    host: '0.0.0.0'
});

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};


server.route({
    method: 'POST',
    path: '/register',
    handler: async (request, h) => {


		// save to db

        return 'data'
    }
});


init();