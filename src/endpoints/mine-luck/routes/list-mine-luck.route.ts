import { GetRoute, RouteHandler } from '@alien-worlds/api-core';
import { ListMineLuckInput } from '../domain/models/list-mine-luck.input';
import { ListMineLuckOutput } from '../domain/models/list-mine-luck.output';

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
        pre: ListMineLuckInput.fromRequest,
        post: (output: ListMineLuckOutput) => output.toResponse(),
      },
    });
  }
}
