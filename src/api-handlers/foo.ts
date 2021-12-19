import fooSchema from '../schemas/foo'

export default function (fastify, opts, next) {
    fastify.get('/foo', {
        schema: fooSchema.GET
    }, async (request, reply) => {
        reply.send('hello world');
    });
    next();
}
