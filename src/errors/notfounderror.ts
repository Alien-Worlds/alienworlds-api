
export default class NotFoundError extends Error {
    statusCode: Number

    constructor (msg) {
        super(msg)
        this.statusCode = 404
    }
}
