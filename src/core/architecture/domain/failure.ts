/**
 * Represents a failure as a result of an error
 * in executing a use case or repository operation.
 * @class
 */
export class Failure<T = Error> {
  /**
   * @private
   * @constructor
   * @param {T} error
   * @param {boolean} throwable
   * @param {boolean} reportable
   */
  private constructor(
    public readonly error: T,
    public readonly throwable: boolean,
    public readonly reportable: boolean
  ) {}

  /**
   * Creates Failure object from the given error.
   *
   * @static
   * @param {T} error
   * @param {boolean} throwable
   * @param {boolean} reportable
   * @returns {Failure}
   */
  public static fromError<T = Error>(
    error: T,
    throwable = false,
    reportable = false
  ): Failure<T> {
    return new Failure<T>(error, throwable, reportable);
  }

  /**
   * creates a Failure with an error
   * containing the given message.
   *
   * @static
   * @param {string} message
   * @param {boolean} throwable
   * @param {boolean} reportable
   * @returns {Failure}
   */
  public static withMessage(
    message: string,
    throwable = false,
    reportable = false
  ): Failure {
    return new Failure(new Error(message), throwable, reportable);
  }
}
