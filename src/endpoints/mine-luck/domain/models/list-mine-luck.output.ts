import { Result } from '@alien-worlds/api-core';
import { MineLuck } from '../entities/mine-luck';
import { UndefinedMineLuckError } from '../errors/undefined-mine-luck.error';

/**
 * @class
 */
export class ListMineLuckOutput {
  public static create(result: Result<MineLuck[]>): ListMineLuckOutput {
    return new ListMineLuckOutput(result);
  }
  /**
   *
   * @constructor
   * @private
   * @param {ListMineLuckResultDto[]} results
   */
  private constructor(public readonly result: Result<MineLuck[]>) {}

  public toResponse() {
    const { result } = this;

    if (result.isFailure) {
      if (result.failure.error instanceof UndefinedMineLuckError) {
        return {
          status: 200,
          body: {},
        };
      }

      return {
        status: 500,
        body: result.failure.error.message,
      };
    }

    return {
      status: 200,
      body: {
        results: result.content.map(entity => entity.toJson()),
        count: result.content.length,
      },
    };
  }
}
