const healthSchema = {
    description: 'Health check',
    tags: ['v1'],
    response: {
        200: {
          type: 'object',
          properties: {
            uptime: { type: 'number' },
            timestamp: { type: 'number' },
            message: { type: 'string' }
          }
        }
      }
};

export default { GET: healthSchema };
