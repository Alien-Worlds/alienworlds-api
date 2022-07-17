import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { MineLuckResponseBody } from '../domain/entities/mine-luck-response-body';
import { GetMineLuckOptions } from '../domain/entities/mine-luck-request-options';
import { MineLuck } from '../domain/entities/mine-luck';

/**
 *
 * @param {Result<MineLuck[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<MineLuck[]>) => {
  if (result.isFailure) {
    // handle failure
  }
  return {
    status: 200,
    body: MineLuckResponseBody.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetMineLuckOptions.fromDto(request.query || {});
};

/**
 * @class
 */
export class GetMineLuckRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetMineLuckRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/mineluck', handler, {
      hooks: {
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
    });
  }
}
