const fetch = require('isomorphic-unfetch')
const { google } = require('googleapis');

module.exports = async function (server, data) {

	const tokens = await server.methods.redisGet('google_tokens')
	const oauth2Client = new google.auth.OAuth2(
		process.env.GOOGLE_CLIENTID,
		process.env.GOOGLE_SECRET,
		'https://ambassador-program-service.herokuapp.com/google-auth'
	  );

	if (!tokens) {
		// refresh!
		console.error('Missing Google Auth Token')
		throw new Error('Missing Google Auth Token')
	}

	oauth2Client.setCredentials(tokens)

	const sheets = google.sheets('v4');
	const values = [
		[
			data.community, data.city, data.code, data.description, data.name, data.email, data.link || ''
		]
	];
	const resource = {
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
			if (err) {
				console.error(err)
				return reject(err)
			}

			resolve(result)
		});
	})

}