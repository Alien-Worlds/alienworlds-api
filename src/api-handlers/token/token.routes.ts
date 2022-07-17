/* eslint-disable @typescript-eslint/no-unused-vars */
import { tokenIoc } from './token.ioc.config';
import { TokenController } from './domain/token.controller';
import { GetTokenRoute } from './routes/get-token.route';

const controller: TokenController = tokenIoc.get<TokenController>(
  TokenController.Token
);

export const tokenRoutes = [
  GetTokenRoute.create(controller.getToken.bind(controller)),
];
