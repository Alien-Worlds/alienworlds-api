/* eslint-disable @typescript-eslint/no-unused-vars */
import { nftsIoc } from './nfts.ioc.config';
import { NftsController } from './domain/nfts.controller';
import { GetNftsRoute } from './routes/get-nfts.route';

const controller: NftsController = nftsIoc.get<NftsController>(
  NftsController.Token
);

export const nftsRoutes = [
  GetNftsRoute.create(controller.getNfts.bind(controller)),
];
