/* eslint-disable @typescript-eslint/no-unused-vars */
import { apiIoc } from '../api.ioc.config';
import { TokenController } from './domain/token.controller';
import { GetTokenRoute } from './routes/get-token.route';

const controller: TokenController = apiIoc.get<TokenController>(
  TokenController.Token
);

export const tokenRoutes = [
  GetTokenRoute.create(controller.getToken.bind(controller)),
];
