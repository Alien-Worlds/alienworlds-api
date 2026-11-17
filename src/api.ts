#!/usr/bin/env node
/* eslint-disable no-unused-vars */
const newrelic = require('newrelic');

process.title = 'eosdac-api';

// const openApi = require('./open-api');
// const {loadConfig} = require('./functions');
// const path = require('path');
import path from 'path';
// Loaded with require() on purpose: fastify 5 ships TypeScript 5 type
// declarations, which the TypeScript 4.5 used here cannot parse.
const fastify = require('fastify');
const fastifySwagger = require('@fastify/swagger');
const fastifySwaggerUi = require('@fastify/swagger-ui');
const fastifyCors = require('@fastify/cors');
const fastifyAutoload = require('@fastify/autoload');
const config = require('./config');
const { MongoClient } = require('mongodb');

const logger = console;

const server = fastify({
  ignoreTrailingSlash: true,
  trustProxy: true,
  logger: true,
});

const docsHost = config.docs_host || 'localhost';
const docsScheme = (config.api.schemes || ['https'])[0];

// OpenAPI 3 document, served at /v1/alienworlds/docs/json (and /yaml, plus the
// UI at /v1/alienworlds/docs). Must be registered before the routes it describes.
server.register(fastifySwagger, {
  openapi: {
    openapi: '3.0.0',
    info: {
      title: 'Alien Worlds API',
      description: 'API for Alien Worlds information',
      version: '1.0.0',
    },
    servers: [{ url: `${docsScheme}://${docsHost}/` }],
  },
});

server.register(fastifySwaggerUi, {
  routePrefix: '/v1/alienworlds/docs',
});

server.register(fastifyAutoload, {
  dir: path.join(__dirname, 'api-handlers'),
  options: {
    prefix: '/v1/alienworlds',
  },
});

const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;

server.register(fastifyCors, {
  allowedHeaders: 'Content-Type',
  origin: '*',
});

const server_address = config.api.host || '127.0.0.1';
const server_port = config.api.port || '8800';

(async () => {
  try {
    // Handlers read the database from `fastify.mongo.db`. The connection is made
    // here, before the server starts, with the same driver as the other processes.
    const mongoClient = await MongoClient.connect(mongo_url);
    server.decorate('mongo', { client: mongoClient, db: mongoClient.db() });
    server.addHook('onClose', async () => {
      await mongoClient.close();
    });

    server.ready().then(
      async () => {
        console.log(
          'New Relic App Name: [' + process.env.NEW_RELIC_APP_NAME + ']'
        );
        console.log(`Started API server on ${server_address}:${server_port}`);
      },
      err => {
        console.error('Error starting API', err);
      }
    );

    await server.listen({ port: Number(server_port), host: server_address });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
