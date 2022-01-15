const tokenSchema = {
  description: 'Get Token Stats',
  summary: 'Fetch current and circulating supply',
  tags: ['v1'],
  querystring: {
    type: 'object',
    properties: {
      type: {
        description: 'Type.  Either circulating or supply',
        type: 'string',
      },
    },
    required: [],
  },
  response: {},
};

export default { GET: tokenSchema };
