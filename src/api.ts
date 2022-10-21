/* istanbul ignore file */

import fastify, { FastifyInstance } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import { config } from './config';
import { setupEndpointDependencies } from './ioc/api.ioc.config';
import { Container } from 'inversify';
import { mountRoutes } from './api.routes';

export const buildAPI = async (ioc: Container): Promise<FastifyInstance> => {
  const api: FastifyInstance = fastify({
    ignoreTrailingSlash: true,
    trustProxy: true,
    logger: true,
  });

  // handle endpoints ioc bindings
  await setupEndpointDependencies(ioc, config);

  // mount routes
  mountRoutes(api, ioc);

  // fastify setup
  api.register(fastifyOas, {
    routePrefix: config.docs.routePrefix,
    exposeRoute: config.docs.exposeRoute,
    swagger: {
      info: {
        title: 'Alien Worlds API',
        description: 'API for Alien Worlds information',
        version: '1.0.0',
      },
      host: config.docs.host,
      schemes: config.schemes,
      consumes: ['application/json'],
      produces: ['application/json'],
    },
  });

  api.register(fastifyCors, {
    allowedHeaders: 'Content-Type',
    origin: '*',
  });

  api.ready().then(
    async () => {
      console.log(`Started API server on ${config.host}:${config.port}`);
      await api.oas();
    },
    err => {
      console.error('Error starting API', err);
    }
  );

  return api;
};
