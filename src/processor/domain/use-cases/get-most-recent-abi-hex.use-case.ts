import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AbiHexRepository } from '../abi-hex.repository';
import { MostRecentAbiHex } from '../entities/most-recent-abi-hex';

/**
 * @class
 */
@injectable()
export class GetMostRecentAbiHexUseCase implements UseCase {
  public static Token = 'GET_MOST_RECENT_ABI_HEX_USE_CASE';

  /**
   * @constructor
   * @param {AbiHexRepository} abiHexRepository
   */
  constructor(
    @inject(AbiHexRepository.Token)
    private abiHexRepository: AbiHexRepository
  ) {}
  public execute(
    account: string,
    blockNumber: bigint,
    fromCurrentBlock: boolean
  ): Result<MostRecentAbiHex> {
    return this.abiHexRepository.getMostRecentAbiHex(
      account,
      blockNumber,
      fromCurrentBlock
    );
  }
}
