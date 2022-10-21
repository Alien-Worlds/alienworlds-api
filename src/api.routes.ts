import { FastifyInstance } from 'fastify';
import { Container } from '@alien-worlds/api-core';
import { FastifyRoute } from './fastify.route';
import { AssetController } from './endpoints/asset/domain/asset.controller';
import { GetAssetRoute } from './endpoints/asset/routes/list-assets.route';
import { MineLuckController } from './endpoints/mine-luck/domain/mine-luck.controller';
import { ListMineLuckRoute } from './endpoints/mine-luck/routes/list-mine-luck.route';
import { MinesController } from './endpoints/mines/domain/mines.controller';
import { ListMinesRoute } from './endpoints/mines/routes/list-mines.route';
import { NftsController } from './endpoints/nfts/domain/nfts.controller';
import { ListNftsRoute } from './endpoints/nfts/routes/list-nfts.route';
import { TokenController } from './endpoints/token/domain/token.controller';
import { GetTokenRoute } from './endpoints/token/routes/get-token.route';

export const mountRoutes = (api: FastifyInstance, ioc: Container) => {
  const assetController = ioc.get<AssetController>(AssetController.Token);
  const mineLuckController = ioc.get<MineLuckController>(
    MineLuckController.Token
  );
  const minesController = ioc.get<MinesController>(MinesController.Token);
  const nftsController = ioc.get<NftsController>(NftsController.Token);
  const tokenController = ioc.get<TokenController>(TokenController.Token);

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
};