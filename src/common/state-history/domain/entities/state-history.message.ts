import { GetBlocksResultDto } from '@common/state-history/data/state-history.dtos';
import { Serialize } from 'eosjs';
import { deserializeMessage } from '../state-history.utils';
import { GetBlocksResult } from './get-blocks.result';

export class StateHistoryMessage<MessageContentType> {
  public readonly version = 'v0';

  public static create(dto: Uint8Array, types: Map<string, Serialize.Type>) {
    const result = deserializeMessage('result', dto, types);
    let content;
    let type;

    if (result) {
      const [resultType, contentDto]: [string, GetBlocksResultDto] = result;
      content = GetBlocksResult.create(contentDto, types);
      type = resultType;
    }

    return new StateHistoryMessage<GetBlocksResult>(type, content);
  }

  private constructor(
    public readonly type: string,
    public readonly content: MessageContentType
  ) {}

  get isGetStatusResult() {
    return this.type === `get_status_result_${this.version}`;
  }

  get isGetBlocksResult() {
    return this.type === `get_blocks_result_${this.version}`;
  }
}
