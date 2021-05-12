import { assetSchema } from '../schemas'
import { NotFoundError } from '../errors'
const { Long } = require('mongodb')

const asset_data = async (asset_id, db) => {
    const collection = db.collection('assets')
    const query = { asset_id: Long.fromString(asset_id) }
    const asset = await collection.findOne(query)

    let asset_data: any = null
    if (asset){
        asset_data = asset.data
        asset_data.asset_id = asset.asset_id
        asset_data.owner = asset.owner
        asset_data.data = asset.data.immutable_serialized_data
        delete asset_data.immutable_serialized_data
    }

    return asset_data
}

const getAsset = async (fastify, request) => {
    const db = fastify.mongo.db
    // console.log(db)
    const limit = request.query.limit || 20
    const offset = request.query.offset || 0
    const asset_id = request.query.id || null
    const owner = request.query.owner || null
    const schema_name = request.query.schema || null
    let asset_ids = []
    let results = []

    if (asset_id){
        const assets = []
        asset_ids = asset_id.split(',')

        asset_ids.forEach(asset_id => {
            const ad = asset_data(asset_id, db);
            if (ad){
                assets.push(ad)
            }
        })

        results = (await Promise.all(assets)).filter(a => a)

        if (!results.length){
            throw new NotFoundError('Asset(s) not found')
        }
    }
    else if (owner){
        const collection = db.collection('assets')
        const query: any = { owner }
        if (schema_name){
            query.schema_name = schema_name
        }
        const assets = await collection.find(query, {skip: offset}).limit(limit)
        // console.log(query, await assets.count())

        await assets.forEach(asset => {
            // console.log(asset)
            let asset_data: any = null
            if (asset){
                asset_data = asset.data
                asset_data.asset_id = asset.asset_id
                asset_data.owner = asset.owner
                asset_data.data = asset.data.immutable_serialized_data
                delete asset_data.immutable_serialized_data

                // console.log(asset_data)
                results.push(asset_data)
            }
        })

        // console.log(ret)
    }

    return { results }
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
