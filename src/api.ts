#!/usr/bin/env node

process.title = 'eosdac-api';

// const openApi = require('./open-api');
// const {loadConfig} = require('./functions');
// const path = require('path');
import path from 'path'
import fastify, { FastifyInstance, RouteShorthandOptions } from "fastify"
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyAutoload from 'fastify-autoload';
import fastifyMongo from 'fastify-mongodb';
import { Server, IncomingMessage, ServerResponse } from "http"
const config = require('./config')

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
        host: config.docs_host || 'localhost',
        schemes: ['https'],
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

const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;
server.register(fastifyMongo, {
    url: mongo_url
});

server.register(fastifyCors, {
    allowedHeaders: 'Content-Type',
    origin: '*'
});

const server_address = process.env.SERVER_ADDR || '127.0.0.1'
const server_port = process.env.SERVER_PORT || '8800'

server.ready().then(async () => {
    console.log(`Started API server with config ${process.env.CONFIG} on ${server_address}:${server_port}`);
    await server.oas();
}, (err) => {
    console.error('Error starting API', err)
});

(async () => {
    try {
        await server.listen(server_port, server_address)
    } catch (err) {
        server.log.error(err);
        process.exit(1)
    }
})();
