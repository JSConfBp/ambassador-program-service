const fetch = require('isomorphic-unfetch')

const createSlackDialog = require('../lib/createSlackDialog')
const getAction = require('../lib/getSlackAction')
const createAmbassadorText = require('../lib/createAmbassadorText')
const titoCreateDiscount = require('../lib/titoCreateDiscount')
const saveToSpreadSheet = require('../lib/saveToSpreadSheet')


/**
 *
 *
 * @param {*} server
 * @param {*} response_url
 * @param {*} trigger_id
 * @param {*} data
 * @returns
 */
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

	try {
		const discountLink = await titoCreateDiscount(data)
		data.link = discountLink
		await server.methods.redisSet(data.id, data)
	} catch (e) {

		console.log(e);

		if (e.code && e.code === 'ERR_TITO_CODE_TAKEN') {
			// discount code already taken
			const resp = await createSlackDialog(data.id, response_url, trigger_id, data.code, {
				title: "This code is already created, please update",
				submit_label: "Update & Approve"
			})

			console.log(resp);
		}

		return;
	}

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


/**
 *
 *
 * @param {*} response_url
 * @param {*} trigger_id
 * @param {*} data
 */
const needGoogleAuth = async function (response_url, trigger_id, data) {

	const authParams = new URLSearchParams({
		prompt: 'consent',
		response_type: 'code',
		redirect_uri: 'https://ambassador-program-service.herokuapp.com/google-auth',
		client_id: process.env.GOOGLE_CLIENTID,
		scope: 'https://www.googleapis.com/auth/spreadsheets',
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

/**
 *
 *
 * @param {*} server
 * @param {*} data
 */
const handleDialogSubmission = async function (server, data) {
	const { state, submission } = data
	const { id, trigger_id, response_url } = JSON.parse(state)

	const storedData = await server.methods.redisGet(id)

	storedData.code = submission.discount_code
	await server.methods.redisSet(id, storedData)

	await approveAction(server, response_url, trigger_id, storedData)
}

/**
 *
 *
 * @param {*} server
 * @param {*} data
 */
const handleInteractiveMessage = async function (server, data) {
	const { actions, response_url, trigger_id } = data
	const action = getAction(actions)
	const id = action.value
	const storedData = await server.methods.redisGet(id)

	if (action.name === 'approve_code') {
		await approveAction(server, response_url, trigger_id, storedData)
	}

	if (action.name === 'edit_code') {
		const resp = await createSlackDialog(id, response_url, trigger_id, storedData.code)

		console.log(await resp.json());
	}
}


/**
 *
 *
 * @param {*} request
 * @param {*} h
 * @returns
 */
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