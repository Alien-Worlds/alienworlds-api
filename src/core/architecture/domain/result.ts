/* eslint-disable @typescript-eslint/no-explicit-any */
import { Failure } from './failure';

/**
 * The class represents the result of executing a use case
 * or repository operation.
 * The result may return a Failure object or the typed content.
 * @class
 */
export class Result<T = void, U = Error> {
  public readonly content: T;
  public readonly failure: Failure<U> | undefined;

  /**
   * Create instances of the class Result
   *
   * @constructor
   * @private
   * @param data
   */
  private constructor(data: { content?: T; failure?: Failure<U> }) {
    const { content, failure } = data || {};
    if (content !== undefined && content !== null) {
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
  public static withContent<T, U = Error>(content: T): Result<T, U> {
    return new Result<T, U>({ content });
  }

  /**
   * Create instance of the Result class with empty content
   *
   * @static
   * @returns {Result<void>}
   */
  public static withoutContent(): Result<void> {
    return new Result({});
  }

  /**
   * Create instance of the Result class with the failure
   *
   * @static
   * @param {Failure} failure
   * @returns
   */
  public static withFailure<U = Error>(failure: Failure<U>): Result<any, U> {
    return new Result<any, U>({ failure });
  }
}
