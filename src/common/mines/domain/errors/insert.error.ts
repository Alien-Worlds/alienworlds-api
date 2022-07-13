import { OperationErrorType } from '@core/architecture/data/errors/data-source-operation.error';

/**
 * Represents an error thrown by the insertOne operation
 *
 * @class
 */
export class InsertError<EntityType = unknown> extends Error {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly entity: EntityType,
    public readonly type: OperationErrorType,
    public readonly error: unknown
  ) {
    super('Insert document error');
  }

  /**
   * Create InsertManyError instance with grouped entities
   * for further handling.
   *
   * @static
   * @param {EntityType} entities
   * @param {DataSourceOperationError[]} writeErrors
   * @param {unknown} concernError
   * @returns {InsertManyError<EntityType>}
   */
  public static create<EntityType>(
    entity: EntityType,
    type: OperationErrorType,
    concernError: unknown
  ): InsertError<EntityType> {
    return new InsertError(entity, type, concernError);
  }
}
