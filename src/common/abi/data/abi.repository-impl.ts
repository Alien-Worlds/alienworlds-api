import { Failure } from '@core/domain/failure';
import { Result } from '@core/domain/result';
import { AbiRepository } from '../domain/abi.repository';
import { Abi } from '../domain/entities/abi';
import { MostRecentAbi } from '../domain/entities/most-recent-abi';
import { AbiLocalSource } from './data-sources/abi.local.source';

/**
 * AbiRepository implementation
 * @class
 */
export class AbiRepositoryImpl implements AbiRepository {
  private mostRecentAbi: MostRecentAbi;
  private localSource: AbiLocalSource = new AbiLocalSource();

  /**
   * Load Abis from ....
   *
   * @async
   * @returns {Abi[]}
   */
  public async load(): Promise<Result<Abi[], Error>> {
    try {
      const dtos = await this.localSource.load('');
      return Result.withContent(dtos.map(Abi.fromDto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get the most recent matching ABI
   *
   * @param {string} account
   * @param {bigint} blockNum
   * @param {boolean=} fromCurrentBlock
   */
  public getMostRecentAbi(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): Result<MostRecentAbi> {
    try {
      const dto = this.localSource.getMostRecentAbi(
        account,
        blockNum,
        fromCurrentBlock
      );
      const hasChanged =
        !this.getMostRecentAbi ||
        dto.filename !== this.mostRecentAbi.data.filename;

      this.mostRecentAbi = MostRecentAbi.create(dto, hasChanged);

      return Result.withContent(this.mostRecentAbi);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
