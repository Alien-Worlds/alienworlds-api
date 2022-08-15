/* istanbul ignore file */
import 'reflect-metadata';

import fastify, { FastifyInstance } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { config } from '@config';
import { setupApiIoc } from './api.ioc.config';
import { FastifyRoute } from '../fastify.route';
import { GetAssetRoute } from './asset/routes/get-assets.route';
import { AssetController } from './asset/domain/asset.controller';
import { MineLuckController } from './mine-luck/domain/mine-luck.controller';
import { GetMineLuckRoute } from './mine-luck/routes/get-mine-luck.route';
import { GetMinesRoute } from './mines/routes/get-mines.route';
import { MinesController } from './mines/domain/mines.controller';
import { NftsController } from './nfts/domain/nfts.controller';
import { GetNftsRoute } from './nfts/routes/get-nfts.route';
import { TokenController } from './token/domain/token.controller';
import { GetTokenRoute } from './token/routes/get-token.route';

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

  // Set IOC
  const apiIoc = await setupApiIoc();
  //
  const assetController: AssetController = apiIoc.get<AssetController>(
    AssetController.Token
  );
  const mineLuckController: MineLuckController = apiIoc.get<MineLuckController>(
    MineLuckController.Token
  );
  const minesController: MinesController = apiIoc.get<MinesController>(
    MinesController.Token
  );
  const nftsController: NftsController = apiIoc.get<NftsController>(
    NftsController.Token
  );
  const tokenController: TokenController = apiIoc.get<TokenController>(
    TokenController.Token
  );

  // Mount routes
  FastifyRoute.mount(
    api,
    GetAssetRoute.create(assetController.getAssets.bind(assetController))
  );
  FastifyRoute.mount(
    api,
    GetMineLuckRoute.create(
      mineLuckController.getMineLuck.bind(mineLuckController)
    )
  );
  FastifyRoute.mount(
    api,
    GetMinesRoute.create(minesController.getMines.bind(minesController))
  );
  FastifyRoute.mount(
    api,
    GetNftsRoute.create(nftsController.getNfts.bind(nftsController))
  );
  FastifyRoute.mount(
    api,
    GetTokenRoute.create(tokenController.getToken.bind(tokenController))
  );

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
