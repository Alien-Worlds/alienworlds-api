import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { Serialize } from 'eosjs';
import { serializeMessage } from '../state-history.utils';

export type GetBlocksRequestOptions = {
  shouldFetchTraces: boolean;
  shouldFetchDeltas: boolean;
};

export class GetBlocksRequest {
  public readonly version = 'v0';

  public static create(
    blockRange: BlockRange,
    options: GetBlocksRequestOptions,
    types: Map<string, Serialize.Type>
  ) {
    const { shouldFetchDeltas, shouldFetchTraces } = options;

    return new GetBlocksRequest(
      blockRange,
      shouldFetchTraces,
      shouldFetchDeltas,
      types
    );
  }

  private constructor(
    public readonly blockRange: BlockRange,
    public readonly shouldFetchTraces: boolean,
    public readonly shouldFetchDeltas: boolean,
    public readonly types: Map<string, Serialize.Type>
  ) {}

  public toUint8Array(): Uint8Array {
    return serializeMessage(
      'request',
      [
        `get_blocks_request_${this.version}`,
        {
          irreversible_only: false,
          start_block_num: Number(this.blockRange.start.toString()),
          end_block_num: Number(this.blockRange.end.toString()),
          max_messages_in_flight: 1,
          have_positions: [],
          fetch_block: true,
          fetch_traces: this.shouldFetchTraces,
          fetch_deltas: this.shouldFetchDeltas,
        },
      ],
      this.types
    );
  }
}
