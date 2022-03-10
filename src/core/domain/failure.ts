export class Failure<T = Error> {
  private constructor(
    public readonly error: T,
    public readonly throwable: boolean,
    public readonly reportable: boolean
  ) {}

  public static fromError<T = Error>(
    error: T,
    throwable = false,
    reportable = false
  ): Failure<T> {
    return new Failure<T>(error, throwable, reportable);
  }

  public static withMessage(
    message: string,
    throwable = false,
    reportable = false
  ): Failure {
    return new Failure(new Error(message), throwable, reportable);
  }
}
