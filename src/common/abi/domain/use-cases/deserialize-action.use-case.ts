import { AbieosService } from '@common/abi/data/services/abieos.service';
import { Failure } from '@core/domain/failure';
import { Params } from '@core/domain/params';
import { Result } from '@core/domain/result';
import { UseCase } from '@core/domain/use-case';
import { inject, injectable } from 'inversify';
import { AbiRepository } from '../abi.repository';

/**
 * Required parameters needed to execute the DeserializeActionUseCase
 * @class
 */
export class DeserializeActionUseCaseParams implements Params {
  /**
   * @private
   * @constructor
   * @param {string} account
   * @param {string} name
   * @param {string} data
   * @param {bigint} blockNumber
   */
  private constructor(
    public readonly account: string,
    public readonly name: string,
    public readonly data: string,
    public readonly blockNumber: bigint
  ) {}
  /**
   * @returns {boolean}
   */
  public isEmpty(): boolean {
    return !this.account && !this.name && !this.data;
  }
  /**
   * Crate DeserializeActionUseCaseParams instance based on given data.
   *
   * @static
   * @returns {DeserializeActionUseCaseParams}
   */
  public static create(
    account: string,
    name: string,
    data: string,
    blockNumber: bigint
  ): DeserializeActionUseCaseParams {
    return new DeserializeActionUseCaseParams(account, name, data, blockNumber);
  }
}

/**
 * @class
 */
@injectable()
export class DeserializeActionUseCase implements UseCase<string> {
  public static Token = 'DESERIALIZE_ACTION_USE_CASE';

  constructor(
    @inject(AbiRepository.Token)
    private abiRepository: AbiRepository,
    @inject(AbieosService.Token)
    private abieosService: AbieosService
  ) {}

  /**
   * Get abi in json format.
   *
   * @private
   * @param {DeserializeActionUseCaseParams} options
   * @param {boolean} fromCurrentBlock
   * @returns {Result<string>}
   */
  private deserializeAction(
    options: DeserializeActionUseCaseParams,
    fromCurrentBlock: boolean
  ): Result<string> {
    const { account, name, blockNumber, data } = options;

    const { content: recentAbi, failure } = this.abiRepository.getMostRecentAbi(
      account,
      blockNumber,
      fromCurrentBlock
    );

    if (failure) {
      return Result.withFailure(failure);
    }

    try {
      // set new hex abi via abieosService
      if (recentAbi.hasChanged) {
        this.abieosService.loadAbiHex(account, recentAbi.data.abiHex);
      }
      const type = this.abieosService.getTypeForAction(account, name);
      const json = this.abieosService.parseDataToJson(
        account,
        type,
        Buffer.from(data)
      );
      return Result.withContent(json);
    } catch (error) {
      return Result.withFailure(Failure.fromError(error));
    }
  }

  /**
   * Return abi as json. It tries without block restriction first.
   * If it fails, it tries to perform operations on the current block only.
   *
   * @param {DeserializeActionUseCaseParams} options
   * @returns {Result<string>}
   */
  public execute(options: DeserializeActionUseCaseParams): Result<string> {
    const deserializeActionResult = this.deserializeAction(options, false);

    if (deserializeActionResult.isFailure) {
      // current block only
      return this.deserializeAction(options, true);
    }

    return deserializeActionResult;
  }
}
