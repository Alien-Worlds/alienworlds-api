import server from './app';
import config from './config';

const address = config.api.host || '127.0.0.1'
const port = config.api.port || '8800'

const mongoUrl = `${config.mongo.url}/${config.mongo.dbName}`;
server.register(fastifyMongo, {
    url: mongoUrl
});

server.register(fastifyCors, {
    allowedHeaders: 'Content-Type',
    origin: '*'
});

server.ready().then(async () => {
    console.log(`Started API server on ${address}:${port}`);
    await server.oas();
}, (err) => {
    console.error('Error starting API', err)
});

(async () => {
    try {
        await server.listen(port, address)
    } catch (err) {
        server.log.error(err);
        process.exit(1)
    }
})();
