if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

const Hapi = require('hapi')
const Boom = require('boom')

const { promisify } = require('util')
const redis = require('redis')

const port = process.env.PORT

const registerRouteHandler = require('./routes/register')
const slackRespondRouteHandler = require('./routes/slack-respond')

const server = Hapi.server({
    port,
    host: '0.0.0.0'
});


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

server.method({
    name: 'redisSet',
    method: redisSet
});

server.method({
    name: 'redisGet',
    method: redisGet,
	cache: {
		expiresIn: 2000,
		generateTimeout: 100
	}
});

*/

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

const init = async () => {
    await server.start();
    console.log(`Server running at: ${server.info.uri}`);
};

init();


/*

[Object: null prototype] {
2018-12-13T13:01:20.409253+00:00 app[web.1]:   payload:
2018-12-13T13:01:20.409258+00:00 app[web.1]:    '


{
	"type":"interactive_message",
	"actions":[
		{"name":"approve_code","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5"}
	],
	"callback_id":"ambassador_approve",
	"team":{"id":"T03ANJQ8X","domain":"jsconfbp"},
	"channel":{"id":"G7L6QRU3D","name":"privategroup"},
	"user":{"id":"U03ANJQ8Z","name":"nec"},
	"action_ts":"1544706080.104591","message_ts":"1544706073.000900",
	"attachment_id":"1","token":"kPSU00iDTNHNhHywEJ2CJJKI","is_app_unfurl":false,
	"original_message":{
		"type":"message","subtype":"bot_message","text":"A new Ambassador has applied!",
		"ts":"1544706073.000900","bot_id":"BESV4LQSE",
		"attachments":[
			{
				"callback_id":"ambassador_approve","fallback":"Sorry :\\/",
				"text":"Frontend Meetup \\/ Jani \\n\\n from Budapest \\n\\n code FRBUJSC19 \\n\\n Foo bar",
				"id":1,"color":"3AA3E3",
				"actions":[{"id":"1","name":"approve_code","text":"Approve","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5","style":""},{"id":"2","name":"edit_code","text":"Edit code","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5","style":""}]}]},
	"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T03ANJQ8X\\/504099550567\\/oZ6KnrDVt4c0MhzXsiiqtwQH",
	"trigger_id":"502444389457.3362636303.7e030fa331ea788a4b5d2511b5d51687"}' }



	Respond to the request we send to your Request URL with a JSON message body directly.

	replace_original



2018-12-13T13:01:25.705979+00:00 app[web.1]: [Object: null prototype] {
2018-12-13T13:01:25.705990+00:00 app[web.1]:   payload:
2018-12-13T13:01:25.705997+00:00 app[web.1]:    '

{
	"type":"interactive_message",
	"actions":[
		{"name":"edit_code","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5"}
	],
	"callback_id":"ambassador_approve",
	"team":{"id":"T03ANJQ8X","domain":"jsconfbp"},
	"channel":{"id":"G7L6QRU3D","name":"privategroup"},
	"user":{"id":"U03ANJQ8Z","name":"nec"},"action_ts":"1544706085.424887","message_ts":"1544706073.000900","attachment_id":"1","token":"kPSU00iDTNHNhHywEJ2CJJKI","is_app_unfurl":false,"original_message":{"type":"message","subtype":"bot_message","text":"A new Ambassador has applied!","ts":"1544706073.000900","bot_id":"BESV4LQSE","attachments":[{"callback_id":"ambassador_approve","fallback":"Sorry :\\/","text":"Frontend Meetup \\/ Jani \\n\\n from Budapest \\n\\n code FRBUJSC19 \\n\\n Foo bar","id":1,"color":"3AA3E3","actions":[{"id":"1","name":"approve_code","text":"Approve","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5","style":""},{"id":"2","name":"edit_code","text":"Edit code","type":"button","value":"80b85f5b-0682-4006-bb3b-a575a4d5f8b5","style":""}]}]},"response_url":"https:\\/\\/hooks.slack.com\\/actions\\/T03ANJQ8X\\/503247352725\\/HlyNklAAgj8zWt2vHbNCymhJ","trigger_id":"503247352741.3362636303.4569f3426bfdc91fa611d0b1099597a4"}' }

2018-12-13T13:01:25.707121+00:00 heroku[router]: at=info method=POST path="/slack-respond" host=ambassador-program-service.herokuapp.com request_id=51082974-bce9-47ab-a3e9-2cb6a3617cf4 fwd="18.207.118.185" dyno=web.1 connect=1ms service=5ms status=200 bytes=159 protocol=https

*/