#!/usr/bin/env node

process.title = 'eosdac-api';

// const openApi = require('./open-api');
// const {loadConfig} = require('./functions');
// const path = require('path');
import path from 'path';
import fastify, { FastifyInstance, RouteShorthandOptions } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyAutoload from 'fastify-autoload';
import fastifyMongo from 'fastify-mongodb';
import { Server, IncomingMessage, ServerResponse } from 'http';
import { config } from './config';
import {
  waitForDependencies,
  waitForMongo,
  waitForRabbitMQ,
} from './api_launcher';
import { createMongoIndexes } from './mongo_setup';

const logger = console;

const server: FastifyInstance<Server, IncomingMessage, ServerResponse> =
  fastify({
    ignoreTrailingSlash: true,
    trustProxy: true,
    logger: true,
  });

const openApi = {
  routePrefix: '/v1/alienworlds/docs',
  exposeRoute: true,
  swagger: {
    info: {
      title: 'Alien Worlds API',
      description: 'API for Alien Worlds information',
      version: '1.0.0',
    },
    host: config.aw_api.docs || 'localhost',
    schemes: config.aw_api.schemes || ['https', 'http'],
    consumes: ['application/json'],
    produces: ['application/json'],
  },
};

server.register(fastifyOas, openApi);

server.register(fastifyAutoload, {
  dir: path.join(__dirname, 'api-handlers'),
  options: {
    prefix: '/v1/alienworlds',
  },
});

const mongo_url = `${config.mongo.url}/${config.mongo.dbName}`;
server.register(fastifyMongo, {
  url: mongo_url,
});
console.log('Connected to mongo db: ', mongo_url);

server.register(fastifyCors, {
  allowedHeaders: 'Content-Type',
  origin: '*',
});

console.log('server host:::::', config);

const server_address = config.aw_api.host;
const server_port = config.aw_api.port ?? '8800';

server.ready().then(
  async () => {
    console.log(`Started API server on ${server_address}:${server_port}`);
    await server.oas();
  },
  (err) => {
    console.error('Error starting API', err);
  }
);

const startAPI = async () => {
  try {
    await server.listen(server_port, server_address);
    console.log('Server listening on port: ', server_port);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

// Start the BlockRange after the dependencies
(async () => {
  await waitForDependencies(
    [waitForMongo, waitForRabbitMQ, createMongoIndexes],
    5000,
    startAPI
  );
})();
