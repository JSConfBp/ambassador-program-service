const { promisify } = require('util')
const redis = require('redis')

module.exports = function (server) {
	let redisClient

	if(process.env.NODE_ENV !== "production") {
		redisClient = redis.createClient({
			host: process.env.REDIS_URL
		})
	} else {
		redisClient = redis.createClient(process.env.REDIS_URL)
	}
	const redisSet = promisify(redisClient.set).bind(redisClient)
	const redisGet = promisify(redisClient.get).bind(redisClient)
	const redisExpire = promisify(redisClient.expire).bind(redisClient)

	server.method({
		name: 'redisSet',
		method: async (id, value) => await redisSet(id, JSON.stringify(value))
	});

	server.method({
		name: 'redisGet',
		method: async (id) => JSON.parse(await redisGet(id))
	});

	server.method({
		name: 'redisExpire',
		method: async (id) => await redisExpire(id)
	});

	return server
}