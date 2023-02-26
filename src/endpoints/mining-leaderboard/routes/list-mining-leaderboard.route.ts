import { ListMiningLeaderboardOutput } from '../domain/models/list-mining-leaderboard.output';
import { ListMiningLeaderboardInput } from '../domain/models/list-mining-leaderboard.input';
import {
  Result,
  Request,
  GetRoute,
  RouteHandler,
  EntityNotFoundError,
} from '@alien-worlds/api-core';
import { MiningLeaderboard } from '@alien-worlds/alienworlds-api-common';

/**
 *
 * @param {Result<MiningLeaderboard[]>} result
 * @returns
 */
export const parseResultToControllerOutput = (
  result: Result<MiningLeaderboard[]>
) => {
  if (result.isFailure) {
    const {
      failure: { error },
    } = result;

    if (error instanceof EntityNotFoundError) {
      return {
        status: 200,
        body: ListMiningLeaderboardOutput.createEmpty(),
      };
    }

    return {
      status: 500,
      body: error.message,
    };
  }

  return {
    status: 200,
    body: ListMiningLeaderboardOutput.fromEntities(result.content),
  };
};

/**
 *
 * @param {Request} request
 * @returns
 */
export const parseRequestToControllerInput = (request: Request) => {
  // parse DTO (query) to the options required by the controller method
  return ListMiningLeaderboardInput.fromRequest(request.query || {});
};

/**
 * @class
 */
export class ListMiningLeaderboardRoute extends GetRoute {
  public static create(handler: RouteHandler) {
    return new ListMiningLeaderboardRoute(handler);
  }

  private constructor(handler: RouteHandler) {
    super('/v1/alienworlds/mining-leaderboard', handler, {
      hooks: {
        pre: parseRequestToControllerInput,
        post: parseResultToControllerOutput,
      },
    });
  }
}
