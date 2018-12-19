const fetch = require('isomorphic-unfetch')
const { google } = require('googleapis');

module.exports = async function (server, data) {


	//await server.methods.redisSet('google_refresh_token', tokens.refresh_token)
	const tokens = await server.methods.redisGet('google_tokens')


	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENTID,
		process.env.GOOGLE_SECRET,
		'https://ambassador-program-service.herokuapp.com/google-auth'
	  );

	oauth2Client.setCredentials(tokens)

	if (!tokens) {
		// refresh!
		throw new Error('Missing Google Auth Token')
	}

	var sheets = google.sheets('v4');

	let values = [
		[
			data.community, data.city, data.code, data.description, data.name, data.email, data.link || ''
		]
	];

	let resource = {
		values,
	};

	return new Promise((resolve, reject) => {
		sheets.spreadsheets.values.append({
			spreadsheetId: process.env.GOOGLE_SPREADSHEET_ID,
			range: process.env.GOOGLE_SPREADSHEET_A1,
			valueInputOption: 'RAW',
			resource,
			auth: oauth2Client,
		}, (err, result) => {
			console.log(err)
			if (err) return reject(err)

			resolve(result)
		});
	})

}




//  scopes :   spreadsheets


/*




https://accounts.google.com/o/oauth2/v2/auth?
redirect_uri=https://developers.google.com/oauthplayground
&
prompt=consent
&
response_type=code
&
client_id=407408718192.apps.googleusercontent.com
&
scope=https://spreadsheets.google.com/feeds/
&
access_type=offline


POST /oauth2/v4/token HTTP/1.1
Host: www.googleapis.com
Content-length: 277
content-type: application/x-www-form-urlencoded
user-agent: google-oauth-playground
code=4%2FtgAljX2fXXqLWGDG-te-X134nF0RAV-k5T0KTcBOy_ziKnrgd6eoS7N-3A4peKKx_83ls464Fy9eAAHZR12njN8&redirect_uri=https%3A%2F%2Fdevelopers.google.com%2Foauthplayground&client_id=407408718192.apps.googleusercontent.com&client_secret=************&scope=&grant_type=authorization_code



refresh token

POST /oauth2/v4/token HTTP/1.1
Host: www.googleapis.com
Content-length: 163
content-type: application/x-www-form-urlencoded
user-agent: google-oauth-playground
client_secret=************&grant_type=refresh_token&refresh_token=1%2FrwLo9jw2VCmUk_TJCDtfjvAIqa8ko8tci0kc8fJXcEA&client_id=407408718192.apps.googleusercontent.com




	Open a channel
	slack://channel?team={TEAM_ID}&id={CHANNEL_ID}
	Open the channel specified by the CHANNEL_ID provided in the id field, like C024BE91L. You must also specify the team with a TEAM_ID.

*/