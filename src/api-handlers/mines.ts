import { minesSchema } from '../schemas'

// const {TextDecoder, TextEncoder} = require('text-encoding');
// const {Api, JsonRpc} = require('@jafri/eosjs2');
// const fetch = require('node-fetch');
// const {getProfiles} = require('../profile-helper.js');
//
// const {loadConfig} = require('../functions');


const getMines = async (fastify, request) => {
    const limit = request.query.limit || 20
    const global_sequence = request.query.global_sequence || 0
    const miner = request.query.miner || null
    const landowner = request.query.landowner || null
    const land_id = request.query.land_id || null
    const planet_name = request.query.planet_name || null
    const from = request.query.from || null
    const to = request.query.to || null

    let res = null, query: any = {}, has_query = false
    const db = fastify.mongo.db
    const collection = db.collection('mines')

    if (miner){
        query.miner = miner
        has_query = true
    }
    if (landowner){
        query.landowner = landowner
        has_query = true
    }
    if (land_id){
        query.land_id = land_id.toString()
        has_query = true
    }
    if (planet_name){
        query.planet_name = planet_name
        has_query = true
    }
    if (from){
        if (typeof query.block_timestamp === 'undefined'){
            query.block_timestamp = {}
        }
        query.block_timestamp.$gte = new Date(Date.parse(from))
        has_query = true
    }
    if (to){
        if (typeof query.block_timestamp === 'undefined'){
            query.block_timestamp = {}
        }
        query.block_timestamp.$lt = new Date(Date.parse(to))
        has_query = true
    }

    if (has_query){
        if (global_sequence){
            query.global_sequence = {'$gt':global_sequence}
        }
        res = collection.find(query).limit(limit)

        const results = []
        await res.forEach(r => {
            results.push(r)
        })
        const count_query = query
        if (count_query.global_sequence){
            delete count_query.global_sequence
        }

        return {results, count: await collection.find(count_query).count()}
    }

    return { error: true, message: 'You must supply either miner, land_id, landowner or planet' }
}


export default function (fastify, opts, next) {
    fastify.get('/mines', {
        schema: minesSchema.GET
    }, async (request, reply) => {
        const res = await getMines(fastify, request)
        reply.send(res)
    });
    next()
}
