import healthSchema from '../schemas/health'

// very basic health check
// TODO: implement more advanced health check with DB and other components etc.

export default function (fastify, opts, next) {
    fastify.get('/health', {
        schema: healthSchema.GET
    }, async (request, response) => {
        try {
            response.status(200).send({
                uptime: process.uptime(),
                message: 'OK',
                timestamp: Date.now(),
            });
        } catch (e) {
            response.status(503).send({
                uptime: process.uptime(),
                message: e,
                timestamp: Date.now(),
            });
        }
    });
    next();
}
