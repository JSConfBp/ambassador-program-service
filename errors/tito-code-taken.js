


module.exports = class TitoCodeTakenError extends Error {
	constructor() {
		super()

		this.code = 'ERR_TITO_CODE_TAKEN'
	}
}