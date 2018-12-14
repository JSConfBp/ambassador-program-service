const fetch = require('isomorphic-unfetch')
const getAction = require('../getAction')
const createAmbassadorText = require('../createAmbassadorText')

const approveAction = async function (response_url, text, trigger_id) {
	const slackData = {
		"text": `*A new Ambassador has been _approved_!* \n\n${text}`,
		"replace_original": "true",
		trigger_id
	}

	if (trigger_id) {
		slackData['trigger_id'] = trigger_id
	}

	await fetch(response_url, {
		method: 'post',
		body: JSON.stringify(slackData)
	})
}

const handleDialogSubmission = async function (server, data) {
	const { state } = data
	const { id, trigger_id, response_url } = JSON.parse(state)

	const storedData = await server.methods.redisGet(id)

	await approveAction(response_url, createAmbassadorText(storedData), trigger_id)
}

const handleInteractiveMessage = async function (server, data) {
	const { actions, response_url, trigger_id } = data
	const action = getAction(actions)
	const id = action.value

	const storedData = await server.methods.redisGet(id)

	if (action.name === 'approve_code') {
		const text = createAmbassadorText(storedData)
		await approveAction(response_url, text, trigger_id)
	}

	if (action.name === 'edit_code') {
		const id = action.value
		const form = {
			trigger_id,
			dialog: {
				"callback_id": "edited_code",
				"title": "Edit Discount Code",
				"submit_label": "Submit",
				"state": JSON.stringify({
					id,
					response_url,
					trigger_id
				}),
				"elements": [
					{
						"type": "text",
						"label": "Discount Code",
						"name": "discount_code",
						value: storedData.code
					}
				]
			}
		}

		fetch(`https://slack.com/api/dialog.open?trigger_id=${trigger_id}`, {
			method: 'post',
			body: JSON.stringify(form),
			headers: {
				"Content-Type": "application/json; charset=utf-8",
				"Authorization": `Bearer ${process.env.SLACK_TOKEN}`
			}
		})
	}
}


module.exports = async (request, h) => {
	const { server } = request
	const { payload } = request.payload

	const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

	console.log(data);

	const { type } = data

	if ('dialog_submission' === type) {
		await handleDialogSubmission(server, data)
	}

	if ('interactive_message' === type) {
		await handleInteractiveMessage(server, data)
	}

	return ''
}