import { Asset } from '@common/assets/domain/entities/asset';
import { GetRoute } from '@core/api/route';
import { Request, RouteHandler } from '@core/api/api.types';
import { Result } from '@core/architecture/domain/result';
import { GetAssetsOptions } from '../domain/entities/asset-request-options';
import { AssetResponseBody } from '../domain/entities/asset-response-body';

/**
 *
 * @param {Result<Asset[]>} result
 * @returns
 */
export const parseHandlerResultToResponse = (result: Result<Asset[]>) => {
  if (result.isFailure) {
    // handle failure
  }
  return {
    status: 200,
    body: AssetResponseBody.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestOptionsToHandlerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return GetAssetsOptions.fromDto(request.query || {});
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
