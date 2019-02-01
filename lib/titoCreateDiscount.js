const fetch = require('isomorphic-unfetch')
const TitoCodeTakenError = require('../errors/tito-code-taken')

module.exports = async function(data) {

	// release-ids	array	An array of the IDs of Releases the discount code can be applied to.
	const postData = {
		data: {
			"type": "discount-codes",
			"attributes":{
				"code": data.code,
				"discount_code_type":"PercentOffDiscountCode",
				"value":"10"
			}
		}
	}

	const response = await fetch(`https://api.tito.io/v2/jsconf-bp/jsconf-budapest-2019/discount_codes`, {
		method: 'post',
		body: JSON.stringify(postData),
		headers: {
			"Content-Type": "application/json; charset=utf-8",
			"Accept": "application/vnd.api+json",
			"Authorization": `Token token=${process.env.TITO_API_KEY}`
		}
	})

	const responseData = await response.json()

	//console.log(response.status);
	//console.log(responseData);

	if (response.status > 300 && responseData.errors) {
		for (let err of responseData.errors) {
			if ('Code has already been taken' === err.detail) throw new TitoCodeTakenError()
		}

		throw new Error('Tito error')
	}

	return responseData.data.links.self
}