if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const { promisify } = require('util')
const Hapi = require('hapi')
const Boom = require('boom')
const uuid = require('uuid/v4')
const redis = require('redis')
const fetch = require('isomorphic-unfetch')
const port = process.env.PORT

const getCode = require('./getCode')

/*
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
*/
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

		const id = uuid();
		const code = getCode(request.payload.community, request.payload.city || '')
		const data = Object.assign({}, request.payload, { id, code })

//		await redisSet(id, data)

		// save to db
		// send to slack

		//

		const slackData = {
			"text": "A new Ambassador has applied!",
			"attachments": [
				{
					"text": `${data.community} / ${data.name} \n\n from ${data.city} \n\n code ${data.code} \n\n ${data.description}`,
					"fallback": "Sorry :/",
					"callback_id": "ambassador_approve",
					"color": "#3AA3E3",
					"attachment_type": "default",
					"actions": [
						{
							"name": "approve_code",
							"text": "Approve",
							"type": "button",
							"value": id
						},
						{
							"name": "edit_code",
							"text": "Edit code",
							"type": "button",
							"value": id
						}
					]
				}
			]
		}

		fetch(process.env.SLACK_WEBHOOK, {
			method: 'post',
			body: JSON.stringify(slackData)
		})

		return ''
    }
});




server.route({
    method: 'POST',
    path: '/slack-respond',
    handler: async (request, h) => {

		console.log(request.payload);


		return ''
    }
});




init();