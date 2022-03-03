import { assetSchema } from '../schemas';
import { NotFoundError } from '../errors';
import { Long } from 'mongodb';

/**
 * Represents the available /asset request query options
 * @type
 */
export type AssetRequestQueryOptions = {
  limit?: number;
  offset?: number;
  id?: string;
  owner?: string;
  schema?: string;
};

/**
 * Represents the data structure of the Asset.data.immutable_serialized_data sub document
 * @type
 */
export type AssetSerializedDataSubDocument = {
  cardid: number;
  name: string;
  img: string;
  backimg: string;
  rarity: string;
  shine: string;
  type: string;
  delay: number;
  difficulty: number;
  ease: number;
  luck: number;
};

/**
 * Represents the data structure of the Asset.data sub document
 * @type
 */
export type AssetDataSubDocument = {
  collection_name: string;
  schema_name: string;
  template_id: string;
  immutable_serialized_data: AssetSerializedDataSubDocument;
};

/**
 * Represents the data structure of the Asset mongoDB document
 * @type
 */
export type AssetDocument = {
  _id: string;
  asset_id: string;
  owner: string;
  data: AssetDataSubDocument;
};

/**
 * Represents the data structure of the AssetResult.data object
 * @type
 */
export type AssetResultData = {
  cardid: number;
  name: string;
  img: string;
  backimg: string;
  rarity: string;
  shine: string;
  type: string;
  delay: number;
  difficulty: number;
  ease: number;
  luck: number;
};

/**
 * Represents asset result (view) model.
 * @class
 */
export class AssetResult {
  private constructor(
    public readonly asset_id: string,
    public readonly owner: string,
    public readonly collection_name: string,
    public readonly schema_name: string,
    public readonly template_id: string,
    public readonly data: AssetResultData
  ) {}

  /**
   * Creates instances of the class AssetResult based on given Asset entity.
   *
   * @static
   * @public
   * @param {Asset} entity
   * @returns {AssetResult} instance of AssetResult
   */
  public static fromEntity(entity: Asset): AssetResult {
    const {
      assetId,
      collectionName,
      schemaName,
      templateId,
      owner,
      cardId,
      name,
      img,
      backImg,
      rarity,
      shine,
      type,
      delay,
      difficulty,
      ease,
      luck,
    } = entity;
    return new AssetResult(
      assetId,
      owner,
      collectionName,
      schemaName,
      templateId,
      {
        cardid: cardId,
        name,
        img,
        backimg: backImg,
        rarity,
        shine,
        type,
        delay,
        difficulty,
        ease,
        luck,
      }
    );
  }
}

/**
 * Represents computed asset entity.
 * @class
 */
export class Asset {
  private constructor(
    public readonly id: string,
    public readonly assetId: string,
    public readonly collectionName: string,
    public readonly schemaName: string,
    public readonly templateId: string,
    public readonly owner: string,
    public readonly cardId: number,
    public readonly name: string,
    public readonly img: string,
    public readonly backImg: string,
    public readonly rarity: string,
    public readonly shine: string,
    public readonly type: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number
  ) {}

  /**
   * Creates instances of the class Asset based on given AssetDocument.
   *
   * @static
   * @public
   * @param {AssetDocument} dto
   * @returns {Asset} instance of Asset
   */
  public static fromDto(dto: AssetDocument): Asset {
    const {
      _id,
      asset_id,
      owner,
      data: {
        immutable_serialized_data: {
          cardid,
          name,
          img,
          backimg,
          rarity,
          shine,
          type,
          delay,
          difficulty,
          ease,
          luck,
        },
        collection_name,
        schema_name,
        template_id,
      },
    } = dto;

    return new Asset(
      _id,
      asset_id,
      collection_name,
      schema_name,
      template_id,
      owner,
      cardid,
      name,
      img,
      backimg,
      rarity,
      shine,
      type,
      delay,
      difficulty,
      ease,
      luck
    );
  }
}

/**
 * Represents the response (DTO) of the /asset route.
 * A serialized object of this class is returned as result of calling /asset route.
 *
 * @class
 */
export class AssetResponse {
  private constructor(public readonly results: AssetResult[]) {}

  /**
   * Creates instances of the class AssetResponse
   *
   * @static
   * @public
   * @param {Asset[]} assets
   * @returns {AssetResponse} instance of `AssetResponse`
   */
  public static create(assets: Asset[]): AssetResponse {
    return new AssetResponse(
      assets.map(asset => AssetResult.fromEntity(asset))
    );
  }
}

/**
 * Pars the given string into an array of integer values
 *
 * @param {string} value
 * @returns {Long[]} an array of Long Objects
 * @see {@link https://mongodb.github.io/node-mongodb-native/api-bson-generated/long.html} for further information about Long class.
 */
export const buildLongIntListFromString = (value: string): Long[] =>
  value.split(',').map(item => Long.fromString(item));

/**
 * Connects to the MongoDB database and retrieves Asset documents based on the request options provided.
 *
 * Documents can be searched by asset "id" or "owner" name. The "offset", "limit", "schema" name options
 * are only combined with the "owner" option.
 *
 * @async
 * @param fastify Fastify instance
 * @param request request object
 * @returns {Promise<Asset[]>} Collection of the `Asset` objects
 */
export const getAssetsCollection = async (
  fastify,
  request
): Promise<Asset[]> => {
  const {
    limit = 20,
    offset = 0,
    id,
    owner,
    schema,
  }: AssetRequestQueryOptions = request.query || {};
  const collection = fastify.mongo.db.collection('assets');
  const assets: Asset[] = [];
  let cursor;

  if (id) {
    const assetIds = buildLongIntListFromString(id);
    cursor = await collection.find({ asset_id: { $in: assetIds } });

    if ((await cursor.count()) === 0) {
      throw new NotFoundError('Asset(s) not found');
    }
  } else if (owner) {
    const query = { owner };

    if (schema) {
      query['data.schema_name'] = schema;
    }
    cursor = await collection.find(query, { skip: offset }).limit(limit);
  }

  if (cursor) {
    for await (const dto of cursor) {
      assets.push(Asset.fromDto(dto));
    }
  }

  return assets;
};

/**
 * GET "/asset" route declaration method
 *
 * @default
 * @param fastify Fastify instance
 * @param opts route options
 * @param next
 */
export default function (fastify, opts, next) {
  fastify.get(
    '/asset',
    {
      schema: assetSchema.GET,
    },
    async (request, reply) => {
      const collection = await getAssetsCollection(fastify, request);
      reply.send(AssetResponse.create(collection));
    }
  );
  next();
}
