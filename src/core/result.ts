import { Failure } from './failure';

/**
 * The class represents the result of executing a use case.
 * The result may return a Failure object or the typed content.
 * @class
 */
export class Result<T> {
  public readonly content: T | undefined;
  public readonly failure: Failure | undefined;

  /**
   * Create instances of the class Result
   *
   * @constructor
   * @private
   * @param data
   */
  private constructor(data: { content?: T; failure?: Failure }) {
    const { content, failure } = data;
    if (content) {
      this.content = content;
    }
    if (failure) {
      this.failure = failure;
    }
  }

  /**
   * @returns {boolean}
   */
  public get isFailure(): boolean {
    return !!this.failure;
  }

  /**
   * Create instance of the Result class with the content
   *
   * @static
   * @param {T} content
   * @returns {Result<T>}
   */
  public static withContent<T>(content: T): Result<T> {
    return new Result<T>({ content });
  }

  /**
   * Create instance of the Result class with the failure
   *
   * @static
   * @param {Failure} failure
   * @returns
   */
  public static withFailure<T>(failure: Failure): Result<T> {
    return new Result<T>({ failure });
  }
}
