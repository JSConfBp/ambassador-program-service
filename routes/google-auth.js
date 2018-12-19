const fetch = require('isomorphic-unfetch')
const querystring = require('querystring')
const saveToSpreadSheet = require('../lib/saveToSpreadSheet')

/**
 *
 *
 * @param {*} server
 */
const processUnsaved = async (server) => {
	const unsaved = await server.methods.redisGet('unsaved')

	console.log(unsaved);

	for (save of unsaved) {
		const data = await server.methods.redisGet(save.id)

		console.log(save);

		await saveToSpreadSheet(server, data)
	}

	await server.methods.redisSet('unsaved', [])
}

/**
 *
 *
 * @param {*} request
 * @param {*} h
 * @returns
 */
module.exports = async (request, h) => {
	const { server, query: { code, scope } } = request
	const formData = querystring.stringify({
		'code': code,
		'redirect_uri': 'https://ambassador-program-service.herokuapp.com/google-auth',
		'client_id': process.env.GOOGLE_CLIENTID,
		'client_secret': process.env.GOOGLE_SECRET,
		'grant_type': 'authorization_code',
		'scope': ''
	})

	const res = await fetch('https://www.googleapis.com/oauth2/v4/token', {
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: formData
	})

	const tokens = await res.json()
	await server.methods.redisSet('google_tokens', tokens)

	processUnsaved(server)

	return ''
}