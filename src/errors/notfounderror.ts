export default class NotFoundError extends Error {
  statusCode: number;

  constructor(msg) {
    super(msg);
    this.statusCode = 404;
  }
}
