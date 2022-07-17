import { Container } from 'inversify';
import { AssetController } from './domain/asset.controller';

const assetIoc = new Container();

assetIoc.bind<AssetController>(AssetController.Token).to(AssetController);

export { assetIoc };
