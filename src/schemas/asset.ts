const assetSchema = {
    description: 'Get Asset',
    summary: 'Fetch an asset',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "id": {
                description: 'Asset ID',
                type: 'string'
            }
        },
        required: []
    },
    response: {}
}

export default {GET: assetSchema}
