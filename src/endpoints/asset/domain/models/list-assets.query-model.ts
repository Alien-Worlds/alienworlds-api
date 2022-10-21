import { AssetDocument } from '@alien-worlds/alienworlds-api-common';
import {
  FindOptions,
  Long,
  MongoFindQueryParams,
  QueryModel,
} from '@alien-worlds/api-core';

export class ListAssetsQueryModel extends QueryModel {
  /**
   *
   * @param owner
   * @param schema
   * @param skip
   * @param limit
   * @returns
   */
  public static create(data: {
    owner?: string;
    schema?: string;
    skip?: number;
    limit?: number;
    assetIds?: bigint[];
  }): ListAssetsQueryModel {
    const { owner, schema, skip, limit, assetIds } = data;
    return new ListAssetsQueryModel(owner, schema, skip, limit, assetIds);
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
    private readonly limit: number,
    private readonly assetIds: bigint[]
  ) {
    super();
  }

  /**
   *
   * @returns
   */
  public toQueryParams(): MongoFindQueryParams<AssetDocument> {
    const { owner, limit, skip, schema, assetIds } = this;
    const filter = {};
    const options: FindOptions = {};

    if (owner) {
      filter['owner'] = owner;
    }

    if (assetIds) {
      filter['asset_id'] = { $in: assetIds.map(id => Long.fromBigInt(id)) };
    }

    if (schema) {
      filter['data.schema_name'] = schema;
    }

    if (Number.isInteger(skip)) {
      options.skip = skip;
    }
    if (Number.isInteger(limit)) {
      options.limit = limit;
    }
    console.log('query', { filter, options });
    return { filter, options };
  }
}
