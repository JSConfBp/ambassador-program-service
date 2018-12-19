const fetch = require('isomorphic-unfetch')
const querystring = require('querystring')
const saveToSpreadSheet = require('../saveToSpreadSheet')

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

	console.log(code, scope);
	console.log(formData);

	const res = await fetch('https://www.googleapis.com/oauth2/v4/token', {
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: formData
	})

	const tokens = await res.json()

	console.log(tokens);

try {
	await server.methods.redisSet('google_tokens', tokens)
} catch (e) {
	console.log(e)
}

	const unsaved = await server.methods.redisGet('unsaved')

console.log(unsaved);


	for (save of unsaved) {
		const data = await server.methods.redisGet(save.id)

		console.log(save);

		await saveToSpreadSheet(server, data)

		// send responses to slack
	}

	return ''
}


/*



POST /oauth2/v4/token HTTP/1.1
Host: www.googleapis.com
Content-length: 277
content-type: application/x-www-form-urlencoded
user-agent: google-oauth-playground

code=4%2FtgAljX2fXXqLWGDG-te-X134nF0RAV-k5T0KTcBOy_ziKnrgd6eoS7N-3A4peKKx_83ls464Fy9eAAHZR12njN8
redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground
client_id=407408718192.apps.googleusercontent.co
client_secret=************
scope=&
grant_type=authorization_code

*/