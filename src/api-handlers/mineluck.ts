/* eslint-disable no-unused-vars */
import { mineLuckSchema } from '../schemas';
import { parseDate } from '../include/parsedate';

/**
 * Represents the data structure of the MineLuck mongoDB document
 * @type
 */
export type MineLuckDocument = {
  total_luck: number;
  total_mines: number;
  planets: string[];
  tools: number[];
  avg_luck: number;
  rarities: string[];
  _id: string;
};

/**
 * Represents computed mine luck data.
 *
 * @class
 */
export class MineLuck {
  private constructor(
    public readonly totalLuck: number,
    public readonly totalMines: number,
    public readonly planets: string[],
    public readonly tools: number[],
    public readonly avgLuck: number,
    public readonly rarities: string[],
    public readonly miner: string
  ) {}

  /**
   * Creates instances of the class MineLuck based on given MineLuckDocument.
   *
   * @static
   * @public
   * @param {MineLuckDocument} dto
   * @returns {MineLuck} instance of MineLuck
   */
  public static fromDto(dto: MineLuckDocument): MineLuck {
    const { _id, total_luck, total_mines, planets, tools, avg_luck, rarities } =
      dto;

    return new MineLuck(
      total_luck,
      total_mines,
      planets,
      tools,
      avg_luck,
      rarities,
      _id
    );
  }
}

/**
 * Represents mineluck (view) model.
 *
 * @class
 */
export class MineLuckResult {
  private constructor(
    public readonly total_luck: number,
    public readonly total_mines: number,
    public readonly planets: string[],
    public readonly tools: number[],
    public readonly avg_luck: number,
    public readonly rarities: string[],
    public readonly miner: string
  ) {}

  /**
   * Creates instances of the class MineLuck based on given MineLuckDocument.
   *
   * @static
   * @public
   * @param {MineLuck} dto
   * @returns {MineLuckResult} instance of MineLuck
   */
  public static fromEntity(entity: MineLuck): MineLuckResult {
    const { totalLuck, totalMines, planets, tools, avgLuck, rarities, miner } =
      entity;

    return new MineLuckResult(
      totalLuck,
      totalMines,
      planets,
      tools,
      avgLuck,
      rarities,
      miner
    );
  }
}

/**
 * Represents the response (DTO) of the /mineluck route.
 * A serialized object of this class is returned as result of calling /mineluck route.
 *
 * @class
 */
export class MineLuckResponse {
  private constructor(
    public readonly results: MineLuckResult[],
    public readonly count: number
  ) {}

  /**
   * Creates instances of the class MineLuckResponse
   *
   * @static
   * @public
   * @param {MineLuck[]} mineLuckCollection
   * @returns {MineLuckResponse} instance of `MineLuckResponse`
   */
  public static create(mineLuckCollection: MineLuck[]): MineLuckResponse {
    return new MineLuckResponse(
      mineLuckCollection.map(entity => MineLuckResult.fromEntity(entity)),
      mineLuckCollection.length
    );
  }
}

/**
 * The function returns the aggregation pipeline - in the form of an object array -
 * used to retrieve the MineLuck data
 *
 * @param {string=} from block timestmap start date
 * @param {string=} to block timestmap end date
 * @returns {Boject[]} aggregation pipeline to retrieve MineLuck documents
 */
export const createMineLuckPipeline = (from?: string, to?: string) => {
  const query: { block_timestamp?: { $gte?: Date; $lt?: Date } } = {};

  if (from) {
    if (typeof query.block_timestamp === 'undefined') {
      query.block_timestamp = {};
    }
    query.block_timestamp.$gte = new Date(parseDate(from));
  }

  if (to) {
    if (typeof query.block_timestamp === 'undefined') {
      query.block_timestamp = {};
    }
    query.block_timestamp.$lt = new Date(parseDate(to));
  }

  const pipeline = [
    { $match: query },
    {
      $group: {
        _id: '$miner',
        total_luck: { $sum: '$params.luck' },
        total_mines: { $sum: 1 },
        planets: { $addToSet: '$planet_name' },
        bag_items: { $addToSet: '$bag_items' },
      },
    },
    { $match: { total_luck: { $gt: 0 } } },
    {
      $addFields: {
        tools: { $arrayElemAt: ['$bag_items', 0] },
        avg_luck: { $divide: ['$total_luck', '$total_mines'] },
      },
    },
    {
      $lookup: {
        from: 'assets',
        localField: 'tools',
        foreignField: 'asset_id',
        as: 'rarities',
      },
    },
    {
      $project: {
        _id: 1,
        total_luck: 1,
        avg_luck: 1,
        total_mines: 1,
        planets: 1,
        tools: 1,
        rarities: {
          $map: {
            input: '$rarities',
            as: 'asset',
            in: '$$asset.data.immutable_serialized_data.rarity',
          },
        },
      },
    },
  ];

  return pipeline;
};

/**
 * Inside the function, the client connects to the MongoDB database and fetch
 * modified (using an aggregation pipeline) documents from the "mines" collection.
 *
 * @async
 * @param fastify Fastify instance
 * @param request request object
 * @returns {Promise<MineLuck[]>} Collection of the `MineLuck` objects
 */
export const getMineLuckCollection = async (
  fastify,
  request
): Promise<MineLuck[]> => {
  const { query: { from = null, to = null } = {} } = request;

  const db = fastify.mongo.db;
  const collection = db.collection('mines');
  const pipeline = createMineLuckPipeline(from, to);
  const documents: MineLuck[] = [];
  const cursor = collection.aggregate(pipeline);

  for await (const dto of cursor) {
    documents.push(MineLuck.fromDto(dto));
  }

  return documents;
};

/**
 * GET "/mineluck" route declaration method
 *
 * @default
 * @param fastify Fastify instance
 * @param opts route options
 * @param next
 */
export default function (fastify, opts, next) {
  fastify.get(
    '/mineluck',
    {
      schema: mineLuckSchema.GET,
    },
    async (request, reply) => {
      const collection = await getMineLuckCollection(fastify, request);
      reply.send(MineLuckResponse.create(collection));
    }
  );
  next();
}
