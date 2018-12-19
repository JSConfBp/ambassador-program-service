module.exports = function (data) {
	return `*${data.community}* / ${data.name} \n\n from _${data.city}_ \n\n code *${data.code}* \n\n ${data.description}`
}