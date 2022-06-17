import { Result } from '@core/architecture/domain/result';
import { UseCase } from '@core/architecture/domain/use-case';
import { inject, injectable } from 'inversify';
import { AbiHexRepository } from '../abi-hex.repository';

/**
 * @class
 */
@injectable()
export class UploadAbiHexUseCase implements UseCase {
  public static Token = 'UPLOAD_ABI_HEX_USE_CASE';

  /**
   * @constructor
   * @param {AbiHexRepository} abiHexRepository
   */
  constructor(
    @inject(AbiHexRepository.Token)
    private abiHexRepository: AbiHexRepository
  ) {}

  /**
   *
   * @param {string} account
   * @param {string} abi
   * @returns {Result}
   */
  public execute(account: string, abi: string): Result {
    return this.abiHexRepository.uploadAbiHex(account, abi);
  }
}
