import { DataSourceOperationError } from '@core/architecture/data/errors/data-source-operation.error';

/**
 * Represents an error thrown by the insertMany operation
 *
 * @class
 */
export class InsertManyError<EntityType = unknown> extends Error {
  /**
   * @private
   * @constructor
   */
  private constructor(
    public readonly insertedEntities: EntityType[],
    public readonly duplicatedEntities: EntityType[],
    public readonly skippedEntities: EntityType[],
    public readonly concernError: unknown
  ) {
    super('Insert many documents error');
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
    entities: EntityType[],
    writeErrors: DataSourceOperationError[],
    concernError: unknown
  ): InsertManyError<EntityType> {
    const groups = {
      duplicates: [],
      skipped: [],
    };
    // Group the entities based on the type of error.
    // --
    // Entity whose index matches the error index will be moved
    // to the appropriate group and replaced with null
    // in the original array to allow filtering those entities
    // that have been sent.
    if (Array.isArray(writeErrors) && writeErrors.length > 0) {
      writeErrors.reduce((collection, writeError) => {
        const entity = entities[writeError.index];
        entities[writeError.index] = null;

        if (writeError.isDuplicateError) {
          collection.duplicates.push(entity);
        } else {
          collection.skipped.push(entity);
        }

        return collection;
      }, groups);

      return new InsertManyError(
        // filter sent entities
        entities.filter(entity => !!entity),
        groups.duplicates,
        groups.skipped,
        concernError
      );
    }
    // In case the error does not contain writeErrors, it means
    // another general error, in which case the entities should
    // be returned as skipped
    return new InsertManyError([], [], entities, concernError);
  }
}
