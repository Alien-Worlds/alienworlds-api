import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { MinesResponseBody } from '../domain/entities/mines-response-body';
import { GetMinesOptions } from '../domain/entities/mines-request-options';
import { Mine } from '@common/mines/domain/entities/mine';

/**
 *
 * @param {Result<Mine[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<Mine[]>) => {
  if (result.isFailure) {
    // handle failure
  }
  return {
    status: 200,
    body: MinesResponseBody.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetMinesOptions.fromDto(request.query || {});
};

/**
 * @class
 */
export class GetMinesRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetMinesRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/mines', handler, {
      hooks: {
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
    });
  }
}
