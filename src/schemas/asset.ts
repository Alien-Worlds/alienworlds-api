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
            },
            "owner": {
                description: 'Owner',
                type: 'string'
            },
            "schema": {
                description: 'Schema Name',
                type: 'string'
            },
            "limit": {
                description: 'Limit',
                type: 'integer'
            },
            "offset": {
                description: 'Offset',
                type: 'integer'
            }
        },
        required: []
    },
    response: {}
}

export default {GET: assetSchema}
