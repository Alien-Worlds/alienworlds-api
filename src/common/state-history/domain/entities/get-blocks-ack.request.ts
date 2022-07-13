import { Serialize } from 'eosjs';
import { serializeMessage } from '../state-history.utils';

export class GetBlocksAckRequest {
  public readonly version = 'v0';

  constructor(
    public readonly messagesCount: number,
    public readonly types: Map<string, Serialize.Type>
  ) {}

  public toUint8Array() {
    return serializeMessage(
      'request',
      [
        `get_blocks_ack_request_${this.version}`,
        { num_messages: this.messagesCount },
      ],
      this.types
    );
  }
}
