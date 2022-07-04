import {
  ActDto,
  ActionTraceDto,
  ReceiptDto,
} from '@common/actions/data/actions.dtos';

export class Act {
  public static create(dto: ActDto): Act {
    const { account, name, authorization, data } = dto;

    //parse DATA

    return new Act(account, name, authorization, data);
  }
  private constructor(
    public readonly account: string,
    public readonly name: string,
    public readonly authorization: { actor: string; permission: string },
    public readonly data: Uint8Array
  ) {}
}

export type AuthSequence = {
  account: string;
  sequence: string;
};

export class Receipt {
  public static create(type: string, dto: ReceiptDto): Receipt {
    const {
      receiver,
      act_digest,
      global_sequence,
      recv_sequence,
      auth_sequence,
      code_sequence,
      abi_sequence,
    } = dto;
    return new Receipt(
      type,
      receiver,
      act_digest,
      global_sequence,
      recv_sequence,
      auth_sequence,
      code_sequence,
      abi_sequence
    );
  }
  private constructor(
    public readonly type: string,
    public readonly receiver: string,
    public readonly actDigest: string,
    public readonly globalSequence: string,
    public readonly recvSequence: string,
    public readonly authSequence: AuthSequence[],
    public readonly codeSequence: number,
    public readonly abiSequence: number
  ) {}
}

export class ActionTrace {
  public static create(type: string, dto: ActionTraceDto): ActionTrace {
    const {
      action_ordinal,
      creator_action_ordinal,
      receiver,
      act,
      context_free,
      elapsed,
      console,
      account_ram_deltas,
      except,
      error_code,
    } = dto;

    let receipt: Receipt;
    if (dto.receipt && dto.receipt.length) {
      const [receiptType, receiptContent] = dto.receipt;
      receipt = Receipt.create(receiptType, receiptContent);
    }

    return new ActionTrace(
      type,
      action_ordinal,
      creator_action_ordinal,
      receipt,
      receiver,
      Act.create(act),
      context_free,
      elapsed,
      console,
      account_ram_deltas,
      except,
      Number(error_code)
    );
  }

  private constructor(
    public readonly type: string,
    public readonly actionOrdinal: number,
    public readonly creatorActionOrdinal: number,
    public readonly receipt: Receipt | null,
    public readonly receiver: string,
    public readonly act: Act,
    public readonly isContextFree: boolean,
    public readonly elapsed: string,
    public readonly console: string,
    public readonly accountRamDeltas: unknown[],
    public readonly except: unknown,
    public readonly error_code: number
  ) {}
}
