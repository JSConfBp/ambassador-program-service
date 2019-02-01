const fetch = require('isomorphic-unfetch')

/**
 *
 *
 * @param {*} id
 * @param {*} response_url
 * @param {*} trigger_id
 * @param {*} code
 * @param {*} [options={}]
 */
module.exports = async function (id, response_url, trigger_id, code, options = {}) {
   	const {
	   title,
	   submit_label
   	} = options

	//console.log('createSlackDialog', {id, response_url, trigger_id, code, options});

	const form = {
		trigger_id,
		dialog: {
			"callback_id": "edited_code",
			"title": title || "Edit Discount Code",
			"submit_label": submit_label || "Approve",
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
					value: code
				}
			]
		}
	}

	console.log('createSlackDialog', JSON.stringify(form))


	return fetch(`https://slack.com/api/dialog.open?trigger_id=${trigger_id}`, {
		method: 'post',
		body: JSON.stringify(form),
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Authorization": `Bearer ${process.env.SLACK_TOKEN}`
		}
	})
}