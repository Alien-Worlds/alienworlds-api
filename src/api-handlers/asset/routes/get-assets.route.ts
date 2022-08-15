import { Asset } from '@common/assets/domain/entities/asset';
import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetAssetsInput } from '../domain/models/get-assets.input';
import { GetAssetsOutput } from '../domain/models/get-assets.output';
import { AssetsNotFoundError } from '@common/assets/domain/errors/assets-not-found.error';

/**
 *
 * @param {Result<Asset[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<Asset[]>) => {
  if (result.isFailure) {
    if (result.failure.error instanceof AssetsNotFoundError) {
      return {
        status: 200,
        body: { results: [] },
      };
    }
  }
  return {
    status: 200,
    body: GetAssetsOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetAssetsInput.fromRequest(request.query || {});
};

/**
 * @class
 */
export class GetAssetRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new GetAssetRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/asset', handler, {
      hooks: {
        pre: parseRequestOptionsToHandlerInput,
        post: parseHandlerResultToResponse,
      },
    });
  }
}
