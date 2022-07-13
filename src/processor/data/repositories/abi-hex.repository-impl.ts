import { Failure } from '@core/architecture/domain/failure';
import { Result } from '@core/architecture/domain/result';
import { AbiHexRepository as AbiHexRepository } from '../../domain/abi-hex.repository';
import { AbiHexNotFoundError } from '../../domain/errors/abi-hex-not-found.error';
import { AbiHexLocalSource } from '../data-sources/abi-hex.local.source';
import { AbiHexFile } from '../abi-hex.dto';
import { AbiEosService } from '../../../common/abi/data/services/abieos.service';
import { MostRecentAbiHex } from '../../domain/entities/most-recent-abi-hex';
import { AbiHex } from '../../domain/entities/abi-hex';
import { blockNumberDescSorter } from '../abi-hex.utils';

/**
 * Represents ABI repository
 * @class
 */
export class AbiHexRepositoryImpl implements AbiHexRepository {
  private mostRecentAbiHex: MostRecentAbiHex;
  private abisByContracts: Map<string, AbiHex[]> = new Map();

  constructor(
    private localSource: AbiHexLocalSource,
    private remoteSource: AbiEosService
  ) {}

  /**
   * Load Abis
   *
   * @async
   * @returns {Promise<Result<AbiHex[]>>}
   */
  public async load(source: string | AbiHexFile[]): Promise<Result<AbiHex[]>> {
    try {
      const dtos: AbiHexFile[] = Array.isArray(source)
        ? source
        : await this.localSource.load(source);

      dtos.sort(blockNumberDescSorter);

      for (const dto of dtos) {
        if (this.abisByContracts.has(dto.contract)) {
          this.abisByContracts.get(dto.contract).push(AbiHex.fromDto(dto));
        } else {
          this.abisByContracts.set(dto.contract, [AbiHex.fromDto(dto)]);
        }
      }

      return Result.withContent(dtos.map(AbiHex.fromDto));
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Get the most recent matching ABI
   *
   * @param {string} account
   * @param {number} blockNum
   * @param {boolean=} fromCurrentBlock
   */
  public getMostRecentAbiHex(
    account: string,
    blockNum: bigint,
    fromCurrentBlock?: boolean
  ): Result<MostRecentAbiHex> {
    try {
      const abis = this.abisByContracts.get(account);
      let abiHex: AbiHex;

      if (!abis || abis.length === 0) {
        return Result.withFailure(
          Failure.fromError(new AbiHexNotFoundError(account))
        );
      }

      for (const abi of abis) {
        if (
          (fromCurrentBlock && blockNum >= BigInt(abi.blockNumber)) ||
          (!fromCurrentBlock && blockNum > BigInt(abi.blockNumber))
        ) {
          abiHex = abi;
          break;
        }
      }

      const hasChanged =
        !this.mostRecentAbiHex ||
        abiHex.filename !== this.mostRecentAbiHex.data.filename;

      this.mostRecentAbiHex = MostRecentAbiHex.create(abiHex, hasChanged);

      return Result.withContent(this.mostRecentAbiHex);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
  /**
   * Send updated abi for the given account.
   *
   * @param {string} account
   * @param {string} abi
   * @returns {Result}
   */
  public uploadAbiHex(account: string, abi: string): Result {
    try {
      this.remoteSource.loadAbiHex(account, abi);
      return Result.withoutContent();
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }
}
