import { nftsSchema } from '../schemas'

const getNFTs = async (fastify, request) => {
    const limit = request.query.limit || 20
    const global_sequence = request.query.global_sequence || 0
    const miner = request.query.miner || null
    const rarity = request.query.rarity || null
    const land_id = request.query.land_id || null
    const from = request.query.from || null
    const to = request.query.to || null

    let res = null, query: any = {}, has_query = false
    const db = fastify.mongo.db
    const collection = db.collection('nfts')

    if (miner){
        query.miner = miner
        has_query = true
    }
    if (land_id){
        query.land_id = land_id.toString()
        has_query = true
    }
    if (rarity){
        if (!['Abundant', 'Common', 'Rare', 'Epic', 'Legendary', 'Mythical'].includes(rarity)){
            throw new Error('Rarity parameter must be Abundant, Common, Rare, Epic, Legendary or Mythical')
        }
        query['template_data.rarity'] = rarity
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
    fastify.get('/nfts', {
        schema: nftsSchema.GET
    }, async (request, reply) => {
        const res = await getNFTs(fastify, request)
        reply.send(res)
    });
    next()
}
