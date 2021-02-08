import { assetSchema } from '../schemas'
const { Long } = require('mongodb')

const asset_data = async (asset_id, db) => {
    let res = null

    const collection = db.collection('assets')
    const query = { asset_id: Long.fromString(asset_id) }
    res = await collection.findOne(query)

    const collection_t = db.collection('templates')
    const query_t = { template_id: res.template_id }
    const res_t = await collection_t.findOne(query_t)

    // console.log(res)
    // console.log(res_t)

    const asset = res

    asset.data = {...res.mutable_serialized_data, ...res.immutable_serialized_data, ...res_t.immutable_data}
    delete asset._id
    delete asset.ram_payer
    delete asset.immutable_serialized_data
    delete asset.mutable_serialized_data
    delete asset.block_num
    delete asset.data_hash
    delete asset.present
    delete asset.block_timestamp
    delete asset.sequence

    if (asset.data.name){
        // make compatible with the atomicassets data
        asset.name = asset.data.name
    }

    return asset
}

const getAsset = async (fastify, request) => {
    const asset_id = request.query.id || null
    if (!asset_id){
        throw new Error('ID is required')
    }
    const asset_ids = asset_id.split(',')

    const db = fastify.mongo.db
    const assets = []
    asset_ids.forEach(asset_id => {
        assets.push(asset_data(asset_id, db))
    })

    return await Promise.all(assets)
}


export default function (fastify, opts, next) {
    fastify.get('/asset', {
        schema: assetSchema.GET
    }, async (request, reply) => {
        const res = await getAsset(fastify, request)
        reply.send(res)
    });
    next()
}
