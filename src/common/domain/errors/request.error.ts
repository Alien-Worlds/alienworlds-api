export type RequestDetails = {
  statusCode: number;
  error: string;
  message: string;
};

export class RequestError extends Error {
  constructor(details: RequestDetails) {
    const { statusCode, error, message } = details;
    super(`[${statusCode}] ${error}: ${message}`);
  }
}
