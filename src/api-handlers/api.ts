/* istanbul ignore file */
import fastify, { FastifyInstance } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import fastifyMongo from 'fastify-mongodb';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { assetRoutes } from './asset/asset.routes';
import { FastifyRoute } from 'fastify.route';
import { config } from '@config';
import { mineLuckRoutes } from './mineluck/mine-luck.routes';
import { minesRoutes } from './mines/mines.routes';
import { nftsRoutes } from './nfts/nfts.routes';
import { tokenRoutes } from './token/token.routes';

export const buildAPI = async (): Promise<FastifyInstance> => {
  const api: FastifyInstance<Server, IncomingMessage, ServerResponse> = fastify(
    {
      ignoreTrailingSlash: true,
      trustProxy: true,
      logger: true,
    }
  );

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

  // Mount routes
  assetRoutes.forEach(route => new FastifyRoute(api, route));
  mineLuckRoutes.forEach(route => new FastifyRoute(api, route));
  minesRoutes.forEach(route => new FastifyRoute(api, route));
  nftsRoutes.forEach(route => new FastifyRoute(api, route));
  tokenRoutes.forEach(route => new FastifyRoute(api, route));

  api.register(fastifyMongo, {
    url: `${config.mongo.url}/${config.mongo.dbName}`,
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
