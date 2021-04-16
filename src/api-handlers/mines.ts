import { minesSchema } from '../schemas'

// const {TextDecoder, TextEncoder} = require('text-encoding');
// const {Api, JsonRpc} = require('@jafri/eosjs2');
// const fetch = require('node-fetch');
// const {getProfiles} = require('../profile-helper.js');
//
// const {loadConfig} = require('../functions');


const getMines = async (fastify, request) => {
    const limit = request.query.limit || 20
    const sort = request.query.sort || null
    const global_sequence_from = request.query.global_sequence_from || 0
    const global_sequence_to = request.query.global_sequence_to || 0
    const miner = request.query.miner || null
    const landowner = request.query.landowner || null
    const land_id = request.query.land_id || null
    const planet_name = request.query.planet_name || null
    const from = request.query.from || null
    const to = request.query.to || null

    if (limit > 5000){
        throw new Error('Limit maximum is 5000')
    }

    let res = null, query: any = {}, has_query = false
    const db = fastify.mongo.db
    const collection = db.collection('mines')

    if (miner){
        query.miner = miner
        has_query = true
    }
    if (landowner){
        if (landowner.indexOf(',') !== -1){
            const landowners = landowner.split(',')
            query.landowner = { $in: landowners }
        }
        else {
            query.landowner = landowner
        }
        has_query = true
    }
    if (land_id){
        if (land_id.indexOf(',') !== -1){
            const land_ids = land_id.split(',')
            query.land_id = { $in: land_ids }
        }
        else {
            query.land_id = land_id
        }
        console.log(query)
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
    let _sort = -1
    if (sort === 'asc' || sort === 'desc'){
        _sort = (sort === 'asc')?1:-1
    }
    else if (sort){
        throw new Error('Sort must be either "asc" or "desc"')
    }

    // perform the query
    if (global_sequence_from){
        if (typeof query.global_sequence === 'undefined'){
            query.global_sequence = {}
        }
        query.global_sequence['$gte'] = global_sequence_from
    }
    if (global_sequence_to){
        if (typeof query.global_sequence === 'undefined'){
            query.global_sequence = {}
        }
        query.global_sequence['$lt'] = global_sequence_to
    }
    res = collection.find(query).sort({global_sequence: _sort}).limit(limit)

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


export default function (fastify, opts, next) {
    fastify.get('/mines', {
        schema: minesSchema.GET
    }, async (request, reply) => {
        const res = await getMines(fastify, request)
        reply.send(res)
    });
    next()
}
