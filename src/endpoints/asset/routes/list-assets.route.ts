/* eslint-disable @typescript-eslint/no-unused-vars */
import { ListAssetsInput } from '../domain/models/list-assets.input';
import { ListAssetsOutput } from '../domain/models/list-assets.output';
import { GetRoute, RouteHandler } from '@alien-worlds/api-core';

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
        pre: ListAssetsInput.fromRequest,
        post: (output: ListAssetsOutput) => output.toResponse(),
      },
    });
  }
}
