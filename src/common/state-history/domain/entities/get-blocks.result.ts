import {
  BlockDto,
  BlockNumberWithIdDto,
  GetBlocksResultDto,
} from '@common/state-history/data/state-history.dtos';
import { parseToBigInt } from '@common/utils/dto.utils';
import { Serialize } from 'eosjs';
import { deserializeMessage } from '../state-history.utils';
import { Block } from './block';
import { Delta } from './delta';
import { Trace } from './trace';

export class BlockNumberWithId {
  public static create(dto: BlockNumberWithIdDto) {
    const { block_id, block_num } = dto;
    return new BlockNumberWithId(parseToBigInt(block_num), block_id);
  }

  private constructor(
    public readonly blockNumber: bigint,
    public readonly blockId: string
  ) {}
}

export class GetBlocksResult {
  public static create(
    content: GetBlocksResultDto,
    types: Map<string, Serialize.Type>
  ) {
    const { head, last_irreversible, prev_block, this_block } = content;
    let block: Block;
    let traces: Trace[] = [];
    let deltas: Delta[] = [];

    if (content.block && content.block.length > 0) {
      const deserializedBlock = deserializeMessage<BlockDto>(
        'signed_block',
        content.block,
        types
      );
      block = Block.create(deserializedBlock);
    }

    if (content.traces && content.traces.length > 0) {
      const tracesByType = deserializeMessage(
        'transaction_trace[]',
        content.traces,
        types
      );
      traces = tracesByType.map(([type, traceDto]) =>
        Trace.create(type, traceDto)
      );
    }

    if (content.deltas && content.deltas.length > 0) {
      const deltasByType = deserializeMessage(
        'table_delta[]',
        content.deltas,
        types
      );
      deltas = deltasByType.map(([type, deltaDto]) =>
        Delta.create(type, deltaDto)
      );
    }

    return new GetBlocksResult(
      BlockNumberWithId.create(head),
      BlockNumberWithId.create(this_block),
      BlockNumberWithId.create(prev_block),
      BlockNumberWithId.create(last_irreversible),
      block,
      traces,
      deltas
    );
  }

  private constructor(
    public readonly head: BlockNumberWithId,
    public readonly thisBlock: BlockNumberWithId,
    public readonly prevBlock: BlockNumberWithId,
    public readonly lastIrreversible: BlockNumberWithId,
    public readonly block: Block,
    public readonly traces: Trace[],
    public readonly deltas: Delta[]
  ) {}
}
