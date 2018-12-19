const fetch = require('isomorphic-unfetch')
const querystring = require('querystring')

module.exports = async (request, h) => {
	const { query: { code, scope } } = request

	console.log(code, scope);

	const formData = querystring.stringify({
		'code': code,
		'redirect_uri': 'https://ambassador-program-service.herokuapp.com/google-token',
		'client_id': process.env.GOOGLE_CLIENTID,
		'client_secret': process.env.GOOGLE_SECRET,
		'grant_type': 'authorization_code'
	})


	console.log(formData);

	const res = await fetch('https://www.googleapis.com/oauth2/v4/token', {
		method: 'post',
		headers: {
			"Content-Type": "application/x-www-form-urlencoded"
		},
		body: formData
	})

	console.log(await res.text());

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