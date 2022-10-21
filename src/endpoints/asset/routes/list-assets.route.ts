import { ListAssetsInput } from '../domain/models/list-assets.input';
import { ListAssetsOutput } from '../domain/models/list-assets.output';
import {
  Result,
  Request,
  GetRoute,
  RouteHandler,
  EntityNotFoundError,
} from '@alien-worlds/api-core';
import { Asset } from '@alien-worlds/alienworlds-api-common';

/**
 *
 * @param {Result<Asset[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (result: Result<Asset[]>) => {
  if (result.isFailure) {
    if (result.failure.error instanceof EntityNotFoundError) {
      return {
        status: 200,
        body: { results: [] },
      };
    }
  }
  return {
    status: 200,
    body: ListAssetsOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return ListAssetsInput.fromRequest(request.query || {});
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
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
      },
    });
  }
}
