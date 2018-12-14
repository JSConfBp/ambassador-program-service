const uuid = require('uuid/v4')
const fetch = require('isomorphic-unfetch')
const getCode = require('../getCode')
const createAmbassadorText = require('../createAmbassadorText')

module.exports = async (request, h) => {

	console.log(request.payload);

	const { payload, server } = request

	const id = uuid();
	const code = getCode(payload.community, payload.city || '')
	const data = Object.assign({}, payload, { id, code })

	await server.methods.redisSet(id, data)

	const slackData = {
		"text": "A new Ambassador has applied!",
		"attachments": [
			{
				"text": createAmbassadorText(data),
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

	await fetch(process.env.SLACK_WEBHOOK, {
		method: 'post',
		body: JSON.stringify(slackData)
	})

	return ''
}
