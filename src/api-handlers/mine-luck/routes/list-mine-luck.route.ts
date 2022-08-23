import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { MineLuck } from '../domain/entities/mine-luck';
import { ListMineLuckInput } from '../domain/models/list-mine-luck.input';
import { ListMineLuckOutput } from '../domain/models/list-mine-luck.output';

/**
 *
 * @param {Result<MineLuck[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (result: Result<MineLuck[]>) => {
  if (result.isFailure) {
    // handle failure
  }
  return {
    status: 200,
    body: ListMineLuckOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return ListMineLuckInput.fromDto(request || {});
};

/**
 * @class
 */
export class ListMineLuckRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new ListMineLuckRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/mineluck', handler, {
      hooks: {
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
      },
    });
  }
}
