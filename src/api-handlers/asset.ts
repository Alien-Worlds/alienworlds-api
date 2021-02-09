import { assetSchema } from '../schemas'
import { NotFoundError } from '../errors'
const { Long } = require('mongodb')

const asset_data = async (asset_id, db) => {
    const collection = db.collection('assets')
    const query = { asset_id: Long.fromString(asset_id) }
    const asset = await collection.findOne(query)

    if (asset){
        delete asset._id
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
        const ad = asset_data(asset_id, db);
        if (ad){
            assets.push(ad)
        }
    })

    const ret = (await Promise.all(assets)).filter(a => a)

    if (!ret.length){
        throw new NotFoundError('Asset(s) not found')
    }

    return ret
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
