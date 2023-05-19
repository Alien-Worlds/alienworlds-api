import { ListNftsInput } from '../domain/models/list-nfts.input';
import { ListNftsOutput } from '../domain/models/list-nfts.output';
import { ListNftsRequestQuery } from '../data/nfts.dtos';
import { GetRoute, RouteHandler, Request } from '@alien-worlds/api-core';

/**
 * @class
 */
export class ListNftsRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new ListNftsRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/nfts', handler, {
      hooks: {
        pre: ListNftsInput.fromRequest,
        post: (output: ListNftsOutput) => output.toResponse(),
      },
      validators: {
        request: (request: Request<unknown, unknown, ListNftsRequestQuery>) => {
          const errors = [];

          if (request.query.sort) {
            const sort = request.query.sort.toLowerCase();

            if (sort !== 'asc' && sort !== 'desc') {
              errors.push(`sort: should be "asc" or "desc"`);
            }
          }

          if (request.query.limit > 1000) {
            errors.push(`limit: should be lower than 1000`);
          }

          return { valid: errors.length === 0, message: errors.join(', ') };
        },
      },
    });
  }
}
