import { mineLuckSchema } from '../schemas';
import { parseDate } from '../include/parsedate';

// const {TextDecoder, TextEncoder} = require('text-encoding');
// const {Api, JsonRpc} = require('@jafri/eosjs2');
// const fetch = require('node-fetch');
// const {getProfiles} = require('../profile-helper.js');
//
// const {loadConfig} = require('../functions');

const getMineLuck = async (fastify, request) => {
  const from = request.query.from || null;
  const to = request.query.to || null;

  let res = null,
    query: any = {};
  // let has_query = false
  const db = fastify.mongo.db;
  const collection = db.collection('mines');

  if (from) {
    if (typeof query.block_timestamp === 'undefined') {
      query.block_timestamp = {};
    }
    query.block_timestamp.$gte = new Date(parseDate(from));
    // has_query = true
  }
  if (to) {
    if (typeof query.block_timestamp === 'undefined') {
      query.block_timestamp = {};
    }
    query.block_timestamp.$lt = new Date(parseDate(to));
    // has_query = true
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
  // console.log(pipeline[0]['$match'])

  res = collection.aggregate(pipeline);

  const results = [];
  await res.forEach(r => {
    r.miner = r._id;
    delete r._id;
    results.push(r);
  });
  // const count_query = query
  // if (count_query.global_sequence){
  //     delete count_query.global_sequence
  // }

  // return {results, count: await collection.find(count_query).count()}
  return { results, count: results.length };
};

export default function (fastify, opts, next) {
  fastify.get(
    '/mineluck',
    {
      schema: mineLuckSchema.GET,
    },
    async (request, reply) => {
      const res = await getMineLuck(fastify, request);
      reply.send(res);
    }
  );
  next();
}
