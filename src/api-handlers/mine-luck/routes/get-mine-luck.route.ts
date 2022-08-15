import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { MineLuck } from '../domain/entities/mine-luck';
import { GetMineLuckInput } from '../domain/models/get-mine-luck.input';
import { GetMineLuckOutput } from '../domain/models/get-mine-luck.output';

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
    body: GetMineLuckOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetMineLuckInput.fromDto(request || {});
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
