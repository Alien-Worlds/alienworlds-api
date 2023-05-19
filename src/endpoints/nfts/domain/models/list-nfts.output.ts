import { Nft } from '@alien-worlds/alienworlds-api-common';
import {
  EntityNotFoundError,
  Result,
  removeUndefinedProperties,
} from '@alien-worlds/api-core';

export class ListNftsOutput {
  public static create(
    listResult: Result<Nft[]>,
    countResult: Result<number>
  ): ListNftsOutput {
    return new ListNftsOutput(listResult, countResult);
  }

  private constructor(
    public readonly listResult: Result<Nft[]>,
    public readonly countResult: Result<number>
  ) {}

  public toResponse() {
    const { listResult, countResult } = this;
    if (listResult.isFailure) {
      const {
        failure: { error },
      } = listResult;
      if (error instanceof EntityNotFoundError) {
        return {
          status: 200,
          body: { results: [], count: -1 },
        };
      }

      return {
        status: 500,
        body: 'Server error',
      };
    }

    return {
      status: 200,
      body: {
        results: listResult.content.map(nft => {
          const {
            id,
            miner,
            params,
            landId,
            rand1,
            rand2,
            rand3,
            templateId,
            blockNumber,
            blockTimestamp,
            globalSequence,
            templateData,
          } = nft;
          const dto = {
            _id: id,
            miner,
            params: params.toDto(),
            land_id: landId,
            rand1,
            rand2,
            rand3,
            template_id: templateId,
            block_num: Number(blockNumber),
            block_timestamp: blockTimestamp,
            global_sequence: Number(globalSequence),
            template_data: templateData.toDto(),
          };

          return removeUndefinedProperties<object>(dto);
        }),
        count: countResult.content || -1,
      },
    };
  }
}
