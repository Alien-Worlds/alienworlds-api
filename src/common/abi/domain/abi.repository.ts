import { Result } from '@core/domain/result';
import { MostRecentAbi } from './entities/most-recent-abi';

/**
 * @abstract
 * @class
 */
export abstract class AbiRepository {
  public static Token = 'ABI_REPOSITORY';

  public abstract load(): Promise<Result<unknown>>;
  public abstract getMostRecentAbi(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): Result<MostRecentAbi>;
}
