const fetch = require('isomorphic-unfetch')
const getAction = require('../getAction')
const createAmbassadorText = require('../createAmbassadorText')
const titoCreateDiscount = require('../titoCreateDiscount')
const saveToSpreadSheet = require('../saveToSpreadSheet')


const approveAction = async function (server, response_url, trigger_id, data) {
	const text = createAmbassadorText(data)
	const slackData = {
		"text": `*A new Ambassador has been _approved_!* \n\n${text}`,
		"replace_original": "true",
		trigger_id
	}

	if (trigger_id) {
		slackData['trigger_id'] = trigger_id
	}

	//const discountLink = await titoCreateDiscount(data)
	//data.link = data
	//await server.methods.redisSet(data.id, storedData)

	try {

// try to save
// no token? refresh
// no / failed refresh? auth

		await saveToSpreadSheet(server, data)
		await fetch(response_url, {
			method: 'post',
			body: JSON.stringify(slackData)
		})
	} catch (e) {
		const unsaved = (await server.methods.redisGet('unsaved')) || []
		unsaved.push({
			trigger_id,
			id: data.id
		})
		await server.methods.redisSet('unsaved', unsaved)
		await needGoogleAuth(response_url, trigger_id, data)
	}
}


const needGoogleAuth = async function (response_url, trigger_id, data) {

	const authParams = new URLSearchParams({
		prompt: 'consent',
		response_type: 'code',
		redirect_uri: 'https://ambassador-program-service.herokuapp.com/google-auth',
		client_id: process.env.GOOGLE_CLIENTID,
		scope: 'https://spreadsheets.google.com/feeds/',
		access_type: 'offline'
	})
	const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
	authUrl.search = authParams

	const slackData = {
		"text": "A new Ambassador has applied!",
		trigger_id,
		"attachments": [
			{
				"text": createAmbassadorText(data),
				"fallback": "Sorry :/",
				"callback_id": "ambassador_approve",
				"color": "#3AA3E3",
				"attachment_type": "default",
				"actions": [
					{
						"type": "button",
						"text": "Save to Spreadsheet",
						"url": authUrl.toString()
					}
				]
			}
		]
	}

	await fetch(response_url, {
		method: 'post',
		body: JSON.stringify(slackData)
	})
}


const handleDialogSubmission = async function (server, data) {
	const { state, submission } = data
	const { id, trigger_id, response_url } = JSON.parse(state)

	const storedData = await server.methods.redisGet(id)

	storedData.code = submission.discount_code
	await server.methods.redisSet(id, storedData)

	await approveAction(server, response_url, trigger_id, storedData)
}


const handleInteractiveMessage = async function (server, data) {
	const { actions, response_url, trigger_id } = data
	const action = getAction(actions)
	const id = action.value
	const storedData = await server.methods.redisGet(id)

	if (action.name === 'approve_code') {
		await approveAction(server, response_url, trigger_id, storedData)
	}

	if (action.name === 'edit_code') {
		const id = action.value
		const form = {
			trigger_id,
			dialog: {
				"callback_id": "edited_code",
				"title": "Edit Discount Code",
				"submit_label": "Save & Approve",
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