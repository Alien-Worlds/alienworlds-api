#!/usr/bin/env node
/* eslint-disable no-unused-vars */
const newrelic = require('newrelic');

process.title = 'eosdac-api';

// const openApi = require('./open-api');
// const {loadConfig} = require('./functions');
// const path = require('path');
import path from 'path';
import fastify, { FastifyInstance } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyAutoload from 'fastify-autoload';
import fastifyMongo from 'fastify-mongodb';
import { Server, IncomingMessage, ServerResponse } from 'http';
const config = require('./config');

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
    host: config.docs_host || 'localhost',
    schemes: config.api.schemes || ['https'],
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

server.register(fastifyCors, {
  allowedHeaders: 'Content-Type',
  origin: '*',
});

const server_address = config.api.host || '127.0.0.1';
const server_port = config.api.port || '8800';

server.ready().then(
  async () => {
    console.log('New Relic App Name: [' + process.env.NEW_RELIC_APP_NAME + ']');
    console.log(`Started API server on ${server_address}:${server_port}`);
    await server.oas();
  },
  err => {
    console.error('Error starting API', err);
  }
);

(async () => {
  try {
    await server.listen(server_port, server_address);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
