/* eslint-disable @typescript-eslint/no-unused-vars */
import { minesIoc } from './mines.ioc.config';
import { MinesController } from './domain/mines.controller';
import { GetMinesRoute } from './routes/get-mines.route';

const controller: MinesController = minesIoc.get<MinesController>(
  MinesController.Token
);

export const minesRoutes = [
  GetMinesRoute.create(controller.getMines.bind(controller)),
];
