process.title = 'eosdac-api';

import path from 'path'
import fastify, { FastifyInstance, RouteShorthandOptions } from "fastify"
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyAutoload from 'fastify-autoload';
import fastifyMongo from 'fastify-mongodb';
import { Server, IncomingMessage, ServerResponse } from "http"
import config from '../config';

const logger = console;

const server: FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
    ignoreTrailingSlash: true,
    trustProxy: true,
    logger: true
});

const openApi = {
    routePrefix: '/v1/alienworlds/docs',
    exposeRoute: true,
    swagger: {
        info: {
            title: 'Alien Worlds API',
            description: 'API for Alien Worlds information',
            version: '1.0.0'
        },
        host: config?.docs_host || 'localhost',
        schemes: config.api.schemes || ['https'],
        consumes: ['application/json'],
        produces: ['application/json']
    }
}

server.register(fastifyOas, openApi);

server.register(fastifyAutoload, {
    dir: path.join(__dirname, 'api-handlers'),
    options: {
        prefix: '/v1/alienworlds'
    }
});

const mongoUrl = `${config.mongo.url}/${config.mongo.dbName}`;
server.register(fastifyMongo, {
    url: mongoUrl
});

server.register(fastifyCors, {
    allowedHeaders: 'Content-Type',
    origin: '*'
});

server.get('/', async function (request, reply) {
    return { hello: 'world' }
  });

export default server;
