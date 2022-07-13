import { MongoError, WriteError } from 'mongodb';

export enum OperationErrorType {
  Duplicate,
  InvalidData,
  Other,
}

/**
 * Represents an error in sending a document to a data source.
 *
 * @class
 */
export class DataSourceOperationError extends Error {
  /**
   * @private
   * @constructor
   * @param {string} message
   * @param {number} index
   * @param {OperationErrorType} type
   * @param {Error} error
   */
  private constructor(
    public readonly message: string,
    public readonly index: number,
    public readonly type: OperationErrorType,
    public readonly error: unknown
  ) {
    super(message);
  }

  public get isDuplicateError() {
    return this.type === OperationErrorType.Duplicate;
  }

  public get isInvalidDataError() {
    return this.type === OperationErrorType.InvalidData;
  }

  private static getTypeByErrorMessage(message: string): OperationErrorType {
    if (
      message.indexOf('key') !== -1 &&
      message.indexOf('must not contain') !== -1
    ) {
      return OperationErrorType.InvalidData;
    }

    if (message.indexOf('E11000') !== -1) {
      return OperationErrorType.Duplicate;
    }

    return OperationErrorType.Other;
  }

  /**
   * Create DataSourceWriteError instance.
   *
   * @static
   * @param {MongoError | Error | WriteError} error
   * @returns {DataSourceOperationError<T>}
   */
  public static fromError(
    error: MongoError | Error | WriteError
  ): DataSourceOperationError {
    const index = (<WriteError>error).index ? (<WriteError>error).index : -1;
    const message = (<WriteError>error).errmsg
      ? (<WriteError>error).errmsg
      : (<Error>error).message;
    const type = this.getTypeByErrorMessage(message);

    return new DataSourceOperationError(message, index, type, error);
  }
}
