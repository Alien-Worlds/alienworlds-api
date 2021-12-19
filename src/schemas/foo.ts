const fooSchema = {
    description: 'Get Foo',
    tags: ['v1'],
    querystring: {
        type: 'object',
        properties: {
            "hello": {
                description: 'hello world',
                type: 'string'
            },
        },
        required: []
    },
    response: {}
}

export default {GET: fooSchema}
