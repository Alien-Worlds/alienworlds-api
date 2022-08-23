import { AssetDocument } from '@common/assets/data/assets.dtos';
import { QueryModel } from '@core/architecture/domain/query-model';
import { MongoFindQueryParams } from '@core/storage/data/mongo.types';
import { FindOptions } from 'mongodb';

export class ListAssetsQueryModel extends QueryModel {
  /**
   *
   * @param owner
   * @param schema
   * @param skip
   * @param limit
   * @returns
   */
  public static create(
    owner: string,
    schema: string,
    skip: number,
    limit: number
  ): ListAssetsQueryModel {
    return new ListAssetsQueryModel(owner, schema, skip, limit);
  }

  /**
   * @private
   * @constructor
   * @param owner
   * @param schema
   * @param skip
   * @param limit
   */
  private constructor(
    private readonly owner: string,
    private readonly schema: string,
    private readonly skip: number,
    private readonly limit: number
  ) {
    super();
  }

  /**
   *
   * @returns
   */
  public toQueryParams(): MongoFindQueryParams<AssetDocument> {
    const { owner, limit, skip, schema } = this;
    const filter = { owner };
    const options: FindOptions<Document> = {};

    if (schema) {
      filter['data.schema_name'] = schema;
    }
    if (Number.isInteger(skip)) {
      options.skip = skip;
    }
    if (Number.isInteger(limit)) {
      options.limit = limit;
    }

    return { filter, options };
  }
}
