/* eslint-disable @typescript-eslint/no-unused-vars */

import { nftsSchema } from '../schemas';

export enum Rarity {
  Abundant = 'Abundant',
  Common = 'Common',
  Rare = 'Rare',
  Epic = 'Epic',
  Legendary = 'Legendary',
  Mythical = 'Mythical',
}

/**
 * Represents the data structure of the NFT mongoDB document
 * @type
 */
export type NFTDocument = {
  _id: string;
  miner: string;
  land_id: string;
  params: {
    invalid?: number;
    error?: string;
    delay?: number;
    difficulty?: number;
    ease?: number;
    luck?: number;
    commission?: number;
  };
  rand1: number;
  rand2: number;
  rand3: number;
  template_id: number;
  block_num: number;
  block_timestamp: {
    date: string;
  };
  global_sequence: number;
  template_data: {
    cardid?: number;
    name?: string;
    img?: string;
    backimg?: string;
    rarity?: string;
    shine?: string;
    description?: string;
    attack?: number;
    defense?: number;
    class?: string;
    movecost?: number;
    race?: string;
    type?: string;
    element?: string;
    delay?: number;
    difficulty?: number;
    ease?: number;
    luck?: number;
  };
};

/**
 * Represents the available /nfts request query options
 * @type
 */
export type NFTsRequestQueryOptions = {
  limit?: number;
  global_sequence_from?: number;
  global_sequence_to?: number;
  sort?: 'asc' | 'desc';
  miner?: string;
  rarity?: string;
  land_id?: string;
  from?: string;
  to?: string;
};

/**
 * Represents nft search query options
 * @type
 */
export type NFTSearchQuery = {
  block_timestamp?: { $gte?: Date; $lt?: Date };
  global_sequence?: { $gte?: number; $lt?: number };
  miner?: string;
  land_id?: { $in: string[] };
  'template_data.rarity'?: string;
};

/**
 * Represents the data structure of the NFT params
 * @type
 */
export type NFTParams = {
  invalid?: number;
  error?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  commission?: number;
};

/**
 * Represents the data structure of the NFT template data
 * @type
 */
export type NFTTemplateData = {
  cardId?: number;
  name?: string;
  img?: string;
  backImg?: string;
  rarity?: string;
  shine?: string;
  description?: string;
  class?: string;
  attack?: number;
  defense?: number;
  moveCost?: number;
  race?: string;
  type?: string;
  element?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
};

/**
 * Represents the data structure of the NFTResult params
 * @type
 */
export type NFTResultParams = {
  invalid?: number;
  error?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
  commission?: number;
};

/**
 * Represents the data structure of the NFTResult template data
 * @type
 */
export type NFTResultTemplateData = {
  cardid?: number;
  name?: string;
  img?: string;
  backimg?: string;
  rarity?: string;
  shine?: string;
  description?: string;
  class?: string;
  attack?: number;
  defense?: number;
  movecost?: number;
  race?: string;
  type?: string;
  element?: string;
  delay?: number;
  difficulty?: number;
  ease?: number;
  luck?: number;
};

/**
 * Represents computed mine luck data.
 *
 * @class
 */
export class NFT {
  private constructor(
    public readonly id: string,
    public readonly miner: string,
    public readonly landId: string,
    public readonly params: NFTParams,
    public readonly rand1: number,
    public readonly rand2: number,
    public readonly rand3: number,
    public readonly templateId: number,
    public readonly blockNumber: number,
    public readonly blockTimestamp: string,
    public readonly globalSequence: number,
    public readonly templateData: NFTTemplateData
  ) {}

  /**
   * Creates instances of the class NFT based on given NFTDocument.
   *
   * @static
   * @public
   * @param {NFTDocument} dto
   * @returns {NFT} instance of NFT
   */
  public static fromDto(dto: NFTDocument): NFT {
    const {
      _id,
      miner,
      land_id,
      params,
      rand1,
      rand2,
      rand3,
      template_id,
      block_num,
      block_timestamp,
      global_sequence,
      template_data,
    } = dto;
    const nftParams: NFTParams = {};
    const nftTemplateData: NFTTemplateData = {};
    const paramsKeys = Object.keys(params || {});

    for (const key of paramsKeys) {
      nftParams[key] = params[key];
    }

    const { cardid, backimg, movecost, ...restTemplateData } =
      template_data || {};
    const templateDataKeys = Object.keys(restTemplateData || {});

    for (const key of templateDataKeys) {
      nftTemplateData[key] = template_data[key];
    }

    if (cardid) {
      nftTemplateData.cardId = cardid;
    }

    if (backimg) {
      nftTemplateData.backImg = backimg;
    }

    if (movecost) {
      nftTemplateData.moveCost = movecost;
    }

    return new NFT(
      _id,
      miner,
      land_id,
      nftParams,
      rand1,
      rand2,
      rand3,
      template_id,
      block_num,
      block_timestamp.date,
      global_sequence,
      nftTemplateData
    );
  }
}

/**
 * Represents NFT (view) model.
 *
 * @class
 */
export class NFTResult {
  private constructor(
    public readonly _id: string,
    public readonly miner: string,
    public readonly land_id: string,
    public readonly params: NFTResultParams,
    public readonly rand1: number,
    public readonly rand2: number,
    public readonly rand3: number,
    public readonly template_id: number,
    public readonly block_num: number,
    public readonly block_timestamp: string,
    public readonly global_sequence: number,
    public readonly template_data: NFTResultTemplateData
  ) {}

  /**
   * Creates instances of the NFTResult based on given NFT entity.
   *
   * @static
   * @public
   * @param {NFT} entity
   * @returns {NFTResult} instance of NFTResult
   */
  public static fromEntity(entity: NFT): NFTResult {
    const {
      id,
      miner,
      landId,
      rand1,
      rand2,
      rand3,
      templateId,
      blockNumber,
      blockTimestamp,
      globalSequence,
      params,
      templateData,
    } = entity;

    const resultParams: NFTResultParams = {};
    const resultTemplateData: NFTResultTemplateData = {};
    const paramsKeys = Object.keys(params || {});

    for (const key of paramsKeys) {
      resultParams[key] = params[key];
    }

    const { cardId, backImg, moveCost, ...restTemplateData } =
      templateData || {};
    const templateDataKeys = Object.keys(restTemplateData || {});

    for (const key of templateDataKeys) {
      resultTemplateData[key] = restTemplateData[key];
    }

    if (cardId) {
      resultTemplateData.cardid = cardId;
    }

    if (backImg) {
      resultTemplateData.backimg = backImg;
    }

    if (moveCost) {
      resultTemplateData.movecost = moveCost;
    }

    return new NFTResult(
      id,
      miner,
      landId,
      resultParams,
      rand1,
      rand2,
      rand3,
      templateId,
      blockNumber,
      blockTimestamp,
      globalSequence,
      resultTemplateData
    );
  }
}

/**
 * Represents the response (DTO) of the /nfts route.
 * A serialized object of this class is returned as result of calling /nfts route.
 *
 * @class
 */
export class NFTsResponse {
  private constructor(
    public readonly results: NFTResult[],
    public readonly count: number
  ) {}

  /**
   * Creates instances of the class NFTsResponse
   *
   * @static
   * @public
   * @param {NFT[]} nfts
   * @param {number} count
   * @returns {NFTsResponse} instance of `NFTsResponse`
   */
  public static create(nfts: NFT[], count: number): NFTsResponse {
    return new NFTsResponse(
      nfts.map(entity => NFTResult.fromEntity(entity)),
      count
    );
  }
}

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
 * Checks if provided value matches any of the rarity types
 * ['Abundant', 'Common', 'Rare', 'Epic', 'Legendary']
 *
 * @param {string} value
 * @returns {boolean}
 */
export const isValidRarity = (value: string): value is Rarity =>
  Object.keys(Rarity).includes(value);

/**
 * Builds a search query based on the options passed in the request
 *
 * @param {MinesRequestQueryOptions} options query options
 * @returns {MinesSearchQuery}
 */
export const buildQuery = (
  options: NFTsRequestQueryOptions
): NFTSearchQuery => {
  const {
    from,
    to,
    global_sequence_from,
    global_sequence_to,
    miner,
    land_id,
    rarity,
  } = options;
  const query: NFTSearchQuery = {};

  if (miner) {
    query.miner = miner;
  }
  if (rarity) {
    if (isValidRarity(rarity)) {
      query['template_data.rarity'] = rarity;
    } else {
      throw new Error(`Rarity parameter must be ${Object.keys(Rarity)}`);
    }
  }
  if (land_id) {
    query.land_id = { $in: land_id.split(',') };
  }
  if (from) {
    query.block_timestamp = { $gte: new Date(Date.parse(from)) };
  }
  if (to && query.block_timestamp) {
    query.block_timestamp.$lt = new Date(Date.parse(to));
  } else if (to && !query.block_timestamp) {
    query.block_timestamp = {
      $lt: new Date(Date.parse(to)),
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

  return query;
};

/**
 * Connects to the MongoDB database and retrieves NFT documents
 * that meet the specified conditions.
 *
 * @async
 * @param fastify Fastify instance
 * @param request request object
 * @returns {Promise<NFT[]>} List of the `NFT` objects
 */
export const getNFTs = async (fastify, request): Promise<NFT[]> => {
  const queryOptions: NFTsRequestQueryOptions = request?.query || {};
  const limit = queryOptions.limit || 20;

  if (limit > 1000) {
    throw new Error('Limit maximum is 1000');
  }

  const db = fastify.mongo.db;
  const collection = db.collection('nfts');
  const sort = getSortingDirectionByString(queryOptions.sort);
  const query = buildQuery(queryOptions);
  const nfts: NFT[] = [];
  const cursor = collection
    .find(query)
    .sort({ global_sequence: sort })
    .limit(limit);

  for await (const dto of cursor) {
    nfts.push(NFT.fromDto(dto));
  }

  return nfts;
};

/**
 * Connects to the MongoDB database and calculates the number of documents
 * that meet the specified conditions.
 *
 * @async
 * @param fastify Fastify instance
 * @param request request object
 * @returns {number} number of NFT documents
 */
export const countNFTs = async (fastify, request): Promise<number> => {
  const {
    global_sequence_from,
    global_sequence_to,
    ...queryOptions
  }: NFTsRequestQueryOptions = request?.query || {};

  const db = fastify.mongo.db;
  const collection = db.collection('nfts');
  const query = buildQuery(queryOptions);

  return collection.find(query).count();
};

/**
 * GET "/nfts" route declaration method
 *
 * @default
 * @param fastify Fastify instance
 * @param opts route options
 * @param next
 */
export default function (fastify, opts, next) {
  fastify.get(
    '/nfts',
    {
      schema: nftsSchema.GET,
    },
    async (request, reply) => {
      const nfts = await getNFTs(fastify, request);
      const count = await countNFTs(fastify, request);
      reply.send(NFTsResponse.create(nfts, count));
    }
  );
  next();
}
