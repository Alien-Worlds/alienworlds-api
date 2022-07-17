import { AssetDocument } from '@common/assets/data/assets.dtos';
import { MongoFindQueryArgs } from '@core/storage/data/mongo.types';
import { FindOptions } from 'mongodb';

export class GetAssetsQuery {
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
  ): GetAssetsQuery {
    return new GetAssetsQuery(owner, schema, skip, limit);
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
  ) {}

  /**
   *
   * @returns
   */
  public toArgs(): MongoFindQueryArgs<AssetDocument> {
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
