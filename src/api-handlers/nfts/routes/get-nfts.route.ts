import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetNftsInput } from '../domain/entities/get-nfts.input';
import { GetNftsOutput } from '../domain/entities/get-nfts.output';

/**
 *
 * @param {Result<NFT[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<GetNftsOutput>) => {
  if (result.isFailure) {
    // handle failure
  }
  const { content } = result;
  return {
    status: 200,
    body: content.toJson(),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetNftsInput.fromDto(request.query || {});
};

/**
 * @class
 */
export class GetNftsRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetNftsRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/nfts', handler, {
      hooks: {
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
    });
  }
}
