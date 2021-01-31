const minesSchema = {
    description: 'Get mines',
    summary: 'Fetch mines by various criteria',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "limit": {
                description: 'Limit result count',
                type: 'integer'
            },
            "sort": {
                description: 'Sort, either asc or desc (default desc)',
                type: 'string'
            },
            "global_sequence_from": {
                description: 'Global sequence number is greater than or equal to this (use for pagination)',
                type: 'integer'
            },
            "global_sequence_to": {
                description: 'Global sequence number is less than this',
                type: 'integer'
            },
            "miner": {
                description: 'The miner',
                type: 'string'
            },
            "land_id": {
                description: 'The land ID',
                type: 'string'
            },
            "landowner": {
                description: 'The landowner',
                type: 'string'
            },
            "planet_name": {
                description: 'The planet',
                type: 'string'
            },
            "from": {
                description: 'Date from as ISO date (inclusive)',
                type: 'string'
            },
            "to": {
                description: 'Date to as ISO date (exclusive)',
                type: 'string'
            }
        },
        required: []
    },
    response: {}
}

export default {GET: minesSchema}
