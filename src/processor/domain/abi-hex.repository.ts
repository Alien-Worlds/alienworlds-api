import { Result } from '@core/architecture/domain/result';
import { injectable } from 'inversify';
import { AbiHexFile } from '../data/abi-hex.dto';
import { AbiHex } from './entities/abi-hex';
import { MostRecentAbiHex } from './entities/most-recent-abi-hex';

/**
 * @abstract
 * @class
 */
@injectable()
export abstract class AbiHexRepository {
  public static Token = 'ABI_HEX_REPOSITORY';

  public abstract uploadAbiHex(account: string, abi: string): Result;
  public abstract load(path: string | AbiHexFile[]): Promise<Result<AbiHex[]>>;
  public abstract getMostRecentAbiHex(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): Result<MostRecentAbiHex>;
}
