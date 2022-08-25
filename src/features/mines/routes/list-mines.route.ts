import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { ListMinesOutput } from '../domain/models/list-mines.output';
import { ListMinesInput } from '../domain/models/list-mines.input';
import { Mine } from '@common/mines/domain/entities/mine';
import { ListMinesRequestDto } from '../data/mines.dtos';

/**
 *
 * @param {Result<Mine[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (result: Result<Mine[]>) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;

    return {
      status: 500,
      body: error.message,
    };
  }
  return {
    status: 200,
    body: ListMinesOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return ListMinesInput.fromRequest(request.query || {});
};

/**
 * @class
 */
export class ListMinesRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new ListMinesRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/mines', handler, {
      hooks: {
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
      },
      validators: {
        request: (request: Request<ListMinesRequestDto>) => {
          const errors = [];

          if (request.query.sort) {
            const sort = request.query.sort.toLowerCase();

            if (sort !== 'asc' && sort !== 'desc') {
              errors.push(`sort: should be "asc" or "desc"`);
            }
          }

          if (request.query.limit > 5000) {
            errors.push(`limit: should be lower than 5000`);
          }

          return { valid: errors.length === 0, message: errors.join(', ') };
        },
      },
    });
  }
}
