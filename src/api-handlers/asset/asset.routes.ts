/* eslint-disable @typescript-eslint/no-unused-vars */
import { AssetController } from './domain/asset.controller';
import { assetIoc } from './asset.ioc.config';
import { GetAssetRoute } from './routes/get-assets.route';

const controller: AssetController = assetIoc.get<AssetController>(
  AssetController.Token
);

export const assetRoutes = [
  GetAssetRoute.create(controller.getAssets.bind(controller)),
];
