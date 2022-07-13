import { BlockRange } from '@common/block-range/domain/entities/block-range';
import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { GetBlocksRequestOptions } from './entities/get-blocks.request';
import { GetBlocksResult } from './entities/get-blocks.result';

@injectable()
export abstract class StateHistoryService {
  public static Token = 'STATE_HISTORY_SERVICE';

  public abstract connect(): Promise<Result<void>>;
  public abstract disconnect(): Promise<Result<void>>;
  public abstract requestBlocks(
    blockRange: BlockRange,
    options: GetBlocksRequestOptions
  ): Promise<Result<void>>;
  public abstract onReceivedBlock(
    handler: (content: GetBlocksResult, blockRange: BlockRange) => Promise<void>
  );
  public abstract onBlockRangeComplete(
    handler: (blockRange: BlockRange) => Promise<void>
  );
  public abstract onError(handler: (error: Error) => Promise<void>);
  public abstract onWarning(handler: (...args: unknown[]) => Promise<void>);
}
