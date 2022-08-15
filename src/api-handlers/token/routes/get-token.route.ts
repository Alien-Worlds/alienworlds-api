import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetTokenInput } from '../domain/models/get-token.input';
import { TokenRequestDto } from '../data/token.dtos';
import { TokenType } from '../token.enums';

/**
 *
 * @param {Result<NFT[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<string>) => {
  if (result.isFailure) {
    // handle failure
    const { error } = result.failure;
    return {
      status: 500,
      body: error.message,
    };
  }
  const { content } = result;

  const supply = parseFloat(content.replace(' TLM', '')).toFixed(4);

  return {
    status: 200,
    body: supply,
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetTokenInput.fromDto(request.query || {});
};

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
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
      validators: {
        request: (request: Request<TokenRequestDto>) => {
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
