export class Failure {
  private constructor(
    public readonly error: Error,
    public readonly throwable: boolean,
    public readonly reportable: boolean
  ) {}

  public static fromError(
    error: Error,
    throwable = false,
    reportable = false
  ): Failure {
    return new Failure(error, throwable, reportable);
  }

  public static withMessage(
    message: string,
    throwable = false,
    reportable = false
  ): Failure {
    return new Failure(new Error(message), throwable, reportable);
  }
}
