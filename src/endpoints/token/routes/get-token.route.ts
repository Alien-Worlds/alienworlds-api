import { GetTokenInput } from '../domain/models/get-token.input';
import { TokenRequestDto } from '../data/dtos/token.dtos';
import { TokenType } from '../token.enums';
import { GetRoute, RouteHandler, Request } from '@alien-worlds/api-core';
import { GetTokenOutput } from '../domain/models/get-token.output';

/**
 * @class
 */
export class GetTokenRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetTokenRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/token', handler, {
      hooks: {
        pre: GetTokenInput.fromRequest,
        post: (output: GetTokenOutput) => output.toResponse(),
      },
      validators: {
        request: (request: Request<unknown, unknown, TokenRequestDto>) => {
          if (request.query.type) {
            const type = request.query.type.toLowerCase();

            if (type !== TokenType.Circulating && type !== TokenType.Supply) {
              return {
                valid: false,
                message: `type: should be "circulating" or "supply"`,
              };
            }
          }

          return { valid: true };
        },
      },
    });
  }
}
