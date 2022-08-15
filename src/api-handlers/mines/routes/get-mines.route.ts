import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetMinesOutput } from '../domain/models/get-mines.output';
import { GetMinesInput } from '../domain/models/get-mines.input';
import { Mine } from '@common/mines/domain/entities/mine';
import { MinesRequestDto } from '../data/mines.dtos';

/**
 *
 * @param {Result<Mine[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<Mine[]>) => {
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
    body: GetMinesOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetMinesInput.fromRequest(request.query || {});
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
      validators: {
        request: (request: Request<MinesRequestDto>) => {
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
