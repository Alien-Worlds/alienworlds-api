const mineLuckSchema = {
    description: 'Get mines',
    summary: 'Fetch mines by various criteria',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
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

export default {GET: mineLuckSchema}
