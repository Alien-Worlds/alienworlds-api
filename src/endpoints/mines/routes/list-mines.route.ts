import { ListMinesOutput } from '../domain/models/list-mines.output';
import { ListMinesInput } from '../domain/models/list-mines.input';
import { ListMinesRequestQuery } from '../data/mines.dtos';
import { Request, GetRoute, RouteHandler } from '@alien-worlds/api-core';

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
        pre: ListMinesInput.fromRequest,
        post: (output: ListMinesOutput) => output.toResponse(),
      },
      validators: {
        request: (
          request: Request<unknown, unknown, ListMinesRequestQuery>
        ) => {
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
