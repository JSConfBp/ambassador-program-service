module.exports = function (community, city) {


	const part = community
		.toUpperCase()
		.replace(/MEETUP|USER GROUP/, '')
		.trim()
		.split(' ')
		.reduce((str, part) => { return str + part.slice(0,2) }, '')

	return part
		.toUpperCase().slice(0,2) + 'JSC19'
}