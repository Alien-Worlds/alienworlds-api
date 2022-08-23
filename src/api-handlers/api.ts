/* istanbul ignore file */
import 'reflect-metadata';

import fastify, { FastifyInstance } from 'fastify';
import fastifyOas from 'fastify-oas';
import fastifyCors from 'fastify-cors';
import { IncomingMessage, Server, ServerResponse } from 'http';
import { config } from '@config';
import { setupApiIoc } from './api.ioc.config';
import { FastifyRoute } from '../fastify.route';
import { GetAssetRoute } from './asset/routes/list-assets.route';
import { AssetController } from './asset/domain/asset.controller';
import { MineLuckController } from './mine-luck/domain/mine-luck.controller';
import { ListMineLuckRoute } from './mine-luck/routes/list-mine-luck.route';
import { ListMinesRoute } from './mines/routes/list-mines.route';
import { MinesController } from './mines/domain/mines.controller';
import { NftsController } from './nfts/domain/nfts.controller';
import { ListNftsRoute } from './nfts/routes/list-nfts.route';
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
    GetAssetRoute.create(assetController.listAssets.bind(assetController))
  );
  FastifyRoute.mount(
    api,
    ListMineLuckRoute.create(
      mineLuckController.listMineLuck.bind(mineLuckController)
    )
  );
  FastifyRoute.mount(
    api,
    ListMinesRoute.create(minesController.listMines.bind(minesController))
  );
  FastifyRoute.mount(
    api,
    ListNftsRoute.create(nftsController.listNfts.bind(nftsController))
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
