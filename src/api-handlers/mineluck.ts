import { mineLuckSchema } from '../schemas'
import { parseDate } from '../include/parsedate'

// const {TextDecoder, TextEncoder} = require('text-encoding');
// const {Api, JsonRpc} = require('@jafri/eosjs2');
// const fetch = require('node-fetch');
// const {getProfiles} = require('../profile-helper.js');
//
// const {loadConfig} = require('../functions');


const getMineLuck = async (fastify, request) => {
    const from = request.query.from || null
    const to = request.query.to || null

    let res = null, query: any = {}, has_query = false
    const db = fastify.mongo.db
    const collection = db.collection('mines')

    if (from){
        if (typeof query.block_timestamp === 'undefined'){
            query.block_timestamp = {}
        }
        query.block_timestamp.$gte = new Date(parseDate(from))
        has_query = true
    }
    if (to){
        if (typeof query.block_timestamp === 'undefined'){
            query.block_timestamp = {}
        }
        query.block_timestamp.$lt = new Date(parseDate(to))
        has_query = true
    }

    const pipeline = [
        {$match: query},
        {$group: {
            _id: "$miner",
            total_luck: {$sum: "$params.luck"},
            total_mines: {$sum: 1},
            planets: {$addToSet: "$planet_name"},
            bag_items: {$addToSet:"$bag_items"}
        }},
        {$match: {total_luck: {$gt: 0}}},
        {$project: {total_mines: 1, total_luck:1, bag_items: {$setUnion:"$tools"}}}
    ]
    // console.log(pipeline[0]['$match'])

    res = collection.aggregate(pipeline)

    const results = []
    await res.forEach(r => {
        r.miner = r._id
        delete r._id
        results.push(r)
    })
    // const count_query = query
    // if (count_query.global_sequence){
    //     delete count_query.global_sequence
    // }

    // return {results, count: await collection.find(count_query).count()}
    return {results, count: results.length}
}


export default function (fastify, opts, next) {
    fastify.get('/mineluck', {
        schema: mineLuckSchema.GET
    }, async (request, reply) => {
        const res = await getMineLuck(fastify, request)
        reply.send(res)
    });
    next()
}
