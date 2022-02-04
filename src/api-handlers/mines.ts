import { minesSchema } from '../schemas';
import { parseDate } from '../include/parsedate';

/**
 * Represents the possible search query options
 * @type
 */
export type MinesSearchQuery = {
  block_timestamp?: { $gte?: Date; $lt?: Date };
  global_sequence?: { $gte?: number; $lt?: number };
  miner?: any;
  landowner?: { $in: string[] };
  land_id?: { $in: string[] };
  planet_name?: string;
  tx_id?: any;
  sort?: any;
};

/**
 * Represents the available /asset request query options
 * @type
 */
export type MinesRequestQueryOptions = {
  limit?: number;
  from?: string;
  to?: string;
  global_sequence_from?: number;
  global_sequence_to?: number;
  miner?: string;
  landowner?: string;
  land_id?: string;
  planet_name?: string;
  tx_id?: string;
  sort?: string;
};

/**
 * Represents the data structure of the Mine mongoDB document
 * @type
 */
export type MineDocument = {
  _id: string;
  miner: string;
  params: {
    invalid?: number;
    error?: string;
    delay?: number;
    difficulty?: number;
    ease?: number;
    luck?: number;
    commission?: number;
  };
  bounty: number;
  land_id: string;
  planet_name: string;
  landowner: string;
  bag_items: number[];
  offset: number;
  block_num: number;
  block_timestamp: {
    date: string;
  };
  global_sequence: number;
  tx_id: string;
};

/**
 * Represents the data structure of the Mine params
 * @type
 */
export type MineParams = {
  invalid?: number;
  error?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  commission?: number;
};

/**
 * The class representing mine entity.
 *
 * @class
 */
export class Mine {
  private constructor(
    public readonly id: string,
    public readonly miner: string,
    public readonly invalid: number,
    public readonly error: string,
    public readonly delay: number,
    public readonly difficulty: number,
    public readonly ease: number,
    public readonly luck: number,
    public readonly commission: number,
    public readonly bounty: number,
    public readonly landId: string,
    public readonly planetName: string,
    public readonly landowner: string,
    public readonly bagItems: number[],
    public readonly offset: number,
    public readonly blockNum: number,
    public readonly blockTimestamp: string,
    public readonly globalSequence: number,
    public readonly txId: string
  ) {}

  /**
   * Creates Mine class based on the provided MineDocument.
   *
   * @static
   * @public
   * @param {MineDocument} dto
   * @returns {Mine} instance of Mine
   */
  public static fromDto(dto: MineDocument): Mine {
    const {
      _id,
      miner,
      params,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
      block_num,
      block_timestamp,
      global_sequence,
      tx_id,
    } = dto;

    const { invalid, error, delay, difficulty, ease, luck, commission } = params || {};

    return new Mine(
      _id,
      miner,
      invalid,
      error,
      delay,
      difficulty,
      ease,
      luck,
      commission,
      bounty,
      land_id,
      planet_name,
      landowner,
      bag_items,
      offset,
      block_num,
      block_timestamp?.date,
      global_sequence,
      tx_id
    );
  }
}

/**
 * The class representing MineResult (view) model.
 *
 * @class
 */
export class MineResult {
  private constructor(
    public readonly _id: string,
    public readonly miner: string,
    public readonly params: MineParams,
    public readonly bounty: number,
    public readonly land_id: string,
    public readonly planet_name: string,
    public readonly landowner: string,
    public readonly bag_items: number[],
    public readonly offset: number,
    public readonly block_num: number,
    public readonly block_timestamp: string,
    public readonly global_sequence: number,
    public readonly tx_id: string
  ) {}

  /**
   * Creates MineResult instance based on the given Mine entity.
   *
   * @static
   * @public
   * @param {Mine} entity
   * @returns {MineResult} instance of MineResult
   */
  public static fromEntity(entity: Mine): MineResult {
    const {
      id,
      miner,
      invalid,
      error,
      delay,
      difficulty,
      ease,
      luck,
      commission,
      bounty,
      landId,
      planetName,
      landowner,
      bagItems,
      offset,
      blockNum,
      blockTimestamp,
      globalSequence,
      txId,
    } = entity;

    return new MineResult(
      id,
      miner,
      {
        invalid,
        error,
        delay,
        difficulty,
        ease,
        luck,
        commission,
      },
      bounty,
      landId,
      planetName,
      landowner,
      bagItems,
      offset,
      blockNum,
      blockTimestamp,
      globalSequence,
      txId
    );
  }
}

/**
 * The class representing MineResponse instance.
 * It is a response to the submitted `/mines` request.
 *
 * @class
 */
export class MinesResponse {
  /**
   * @private
   * @constructor
   * @param {MineResult[]} results
   * @param {number} count
   */
  private constructor(public readonly results: MineResult[], public readonly count: number = -1) {}

  /**
   * Creates instances of the class MinesResponse
   *
   * @static
   * @public
   * @param {Mine[]} mines Mines entities collection
   * @returns {MinesResponse} instance of `MinesResponse`
   */
  public static create(mines: Mine[]): MinesResponse {
    return new MinesResponse(
      mines.map(entity => MineResult.fromEntity(entity)),
      // TODO: why we hardcode -1, to fix when refactoring
      -1 //mines.length
    );
  }
}

/**
 * Builds a search query based on the options passed in the request
 *
 * @param {MinesRequestQueryOptions} options query options
 * @returns {MinesSearchQuery}
 */
export const buildQuery = (options: MinesRequestQueryOptions): MinesSearchQuery => {
  const { from, to, global_sequence_from, global_sequence_to, miner, landowner, land_id, planet_name, tx_id } = options;
  let query: MinesSearchQuery = {};

  if (miner) {
    query.miner = miner;
  }
  if (landowner) {
    query.landowner = { $in: landowner.split(',') };
  }
  if (land_id) {
    query.land_id = { $in: land_id.split(',') };
  }
  if (planet_name) {
    query.planet_name = planet_name;
  }
  if (from) {
    query.block_timestamp = { $gte: new Date(parseDate(from)) };
  }
  if (to && query.block_timestamp) {
    query.block_timestamp.$lt = new Date(parseDate(to));
  } else if (to && !query.block_timestamp) {
    query.block_timestamp = {
      $lt: new Date(parseDate(to)),
    };
  }

  if (global_sequence_from) {
    query.global_sequence = { $gte: global_sequence_from };
  }

  if (global_sequence_to && query.global_sequence) {
    query.global_sequence.$lt = global_sequence_to;
  } else if (global_sequence_to && !query.global_sequence) {
    query.global_sequence = { $lt: global_sequence_to };
  }

  if (tx_id) {
    query = { tx_id };
  }

  return query;
};

/**
 * Returns the numeric sort direction based on the provided expression.
 * Without an argument, the function returns -1, otherwise it returns
 * the appropriate value. If an invalid argument is given, the function returns an error
 *
 * @param {string=} value
 * @returns {number}
 */
export const getSortingDirectionByString = (value?: string): number => {
  if (value) {
    if (value.toLowerCase() === 'asc') return 1;
    if (value.toLowerCase() === 'desc') return -1;
    throw new Error('Sort must be either "asc" or "desc"');
  }
  return -1;
};

/**
 * Connects to the MongoDB database and retrieves mine documents
 * based on the query options provided
 *
 * @async
 * @param fastify Fastify instance
 * @param request request object
 * @returns {Promise<Mine[]>} List of the `Mine` objects
 */
export const getMinesCollection = async (fastify, request): Promise<Mine[]> => {
  const queryOptions: MinesRequestQueryOptions = request?.query || {};
  const limit = queryOptions.limit || 20;

  if (limit > 5000) {
    throw new Error('Limit maximum is 5000');
  }

  const db = fastify.mongo.db;
  const collection = db.collection('mines');
  const sort = getSortingDirectionByString(queryOptions.sort);
  const query = buildQuery(queryOptions);
  const mines: Mine[] = [];
  const cursor = collection.find(query).sort({ global_sequence: sort }).limit(limit);

  for await (const dto of cursor) {
    mines.push(Mine.fromDto(dto));
  }

  return mines;
};

/**
 * GET "/mines" route declaration method
 *
 * @default
 * @param fastify Fastify instance
 * @param opts route options
 * @param next
 */
export default function (fastify, opts, next) {
  fastify.get(
    '/mines',
    {
      schema: minesSchema.GET,
    },
    async (request, reply) => {
      const collection = await getMinesCollection(fastify, request);
      reply.send(MinesResponse.create(collection));
    }
  );
  next();
}
