/* eslint-disable @typescript-eslint/no-unused-vars */
import { mineLuckIoc } from './mine-luck.ioc.config';
import { MineLuckController } from './domain/mine-luck.controller';
import { GetMineLuckRoute } from './routes/get-mine-luck.route';

const controller: MineLuckController = mineLuckIoc.get<MineLuckController>(
  MineLuckController.Token
);

export const mineLuckRoutes = [
  GetMineLuckRoute.create(controller.getMineLuck.bind(controller)),
];
