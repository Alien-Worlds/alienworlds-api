import { tokenSchema } from '../schemas'
import fetch from 'node-fetch'
const config = require('../config')

const getTokenSupplies = async (fastify, request) => {
    // const stats =

    // console.log(fetch, config)
    const url = `${config.endpoints[0]}/v1/chain/get_currency_stats`
    const req_data = {
        json: true,
        code: 'alien.worlds',
        symbol: 'TLM'
    }

    const res = await fetch(url, {
        method: 'POST',
        body:    JSON.stringify(req_data),
        headers: { 'Content-Type': 'application/json' },
    })
    const json = await res.json()
    // console.log(json)

    const results = {
        supply: json.TLM.supply
    }

    return {results}
}


export default function (fastify, opts, next) {
    fastify.get('/token', {
        schema: tokenSchema.GET
    }, async (request, reply) => {
        const res = await getTokenSupplies(fastify, request)
        reply.send(res)
    });
    next()
}
