const fetch = require('isomorphic-unfetch')
const getAction = require('../getAction')

module.exports = async (request, h) => {
	const { payload } = request.payload

	const data = typeof payload === 'string' ? JSON.parse(payload) : payload;

	console.log(data);

	const { actions, response_url , original_message, trigger_id } = data

	const action = getAction(actions)

	if (action.name === 'approve_code') {

		const id = action.value


		const slackData = {
			"text": `*A new Ambassador has been _approved_!* \n\n${original_message.attachments[0].text}`,
			"replace_original": "true",
			trigger_id
		}

		await fetch(response_url, {
			method: 'post',
			body: JSON.stringify(slackData)
		})

	}

	if (action.name === 'edit_code') {
		const id = action.value




		const form = {
			"callback_id": "edited_code",
			"title": "Request a Ride",
			"submit_label": "Request",
			"state": "Limo",
			"elements": [
			  {
				"type": "text",
				"label": "Pickup Location",
				"name": "loc_origin"
			  },
			  {
				"type": "text",
				"label": "Dropoff Location",
				"name": "loc_destination"
			  }
			]
		  }

		  const res = await fetch(`https://slack.com/api/dialog.open?trigger_id=${trigger_id}`, {
				method: 'post',
				body: JSON.stringify(form),
				headers: {
					"Content-Type": "application/json; charset=utf-8",
					"Authorization": process.env.SLACK_TOKEN
				}
			})


			console.log(await res.json());

//

	}

	return 'OK'
}